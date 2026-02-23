import { BaseService } from '@cool-midway/core';
import { Config, Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import * as md5 from 'md5';
import { Equal, EntityManager, In, IsNull, Repository } from 'typeorm';
import { v1 as uuid } from 'uuid';
import { BaseSysRoleEntity } from '../../base/entity/sys/role';
import { BaseSysUserEntity } from '../../base/entity/sys/user';
import { BaseSysUserRoleEntity } from '../../base/entity/sys/user_role';
import { UserAccountBindEntity } from '../entity/account_bind';
import { UserInfoEntity } from '../entity/info';

type UserSyncConfig = {
  enable?: boolean;
  usernamePrefix?: string;
  defaultRoleLabels?: string[];
  autoBindByPhone?: boolean;
  updateAdminProfileOnLogin?: boolean;
  defaultTenantIdForAppUser?: number | null;
};

const DEFAULT_SYNC_CONFIG: Required<Omit<UserSyncConfig, 'defaultTenantIdForAppUser'>> & {
  defaultTenantIdForAppUser: number | null;
} = {
  enable: true,
  usernamePrefix: 'mini_u_',
  defaultRoleLabels: [],
  autoBindByPhone: true,
  updateAdminProfileOnLogin: true,
  defaultTenantIdForAppUser: null,
};

/**
 * C端用户与后台账号自动同步
 */
@Provide()
export class UserIdentitySyncService extends BaseService {
  @InjectEntityModel(UserInfoEntity)
  userInfoEntity: Repository<UserInfoEntity>;

  @InjectEntityModel(UserAccountBindEntity)
  userAccountBindEntity: Repository<UserAccountBindEntity>;

  @InjectEntityModel(BaseSysUserEntity)
  baseSysUserEntity: Repository<BaseSysUserEntity>;

  @InjectEntityModel(BaseSysRoleEntity)
  baseSysRoleEntity: Repository<BaseSysRoleEntity>;

  @InjectEntityModel(BaseSysUserRoleEntity)
  baseSysUserRoleEntity: Repository<BaseSysUserRoleEntity>;

  @Config('module.user.sync')
  syncConfig: UserSyncConfig;

  private getSyncConfig() {
    const c = this.syncConfig ?? {};
    return {
      enable: c.enable ?? DEFAULT_SYNC_CONFIG.enable,
      usernamePrefix: c.usernamePrefix ?? DEFAULT_SYNC_CONFIG.usernamePrefix,
      defaultRoleLabels: c.defaultRoleLabels ?? DEFAULT_SYNC_CONFIG.defaultRoleLabels,
      autoBindByPhone: c.autoBindByPhone ?? DEFAULT_SYNC_CONFIG.autoBindByPhone,
      updateAdminProfileOnLogin:
        c.updateAdminProfileOnLogin ?? DEFAULT_SYNC_CONFIG.updateAdminProfileOnLogin,
      defaultTenantIdForAppUser:
        c.defaultTenantIdForAppUser !== undefined
          ? c.defaultTenantIdForAppUser
          : DEFAULT_SYNC_CONFIG.defaultTenantIdForAppUser,
    };
  }

  /**
   * 小程序登录后同步账号
   */
  async syncByAppUserId(appUserId: number) {
    const config = this.getSyncConfig();
    if (!config.enable) {
      return;
    }

    await this.userInfoEntity.manager.transaction(async em => {
      const appUserRepo = em.getRepository(UserInfoEntity);
      const bindRepo = em.getRepository(UserAccountBindEntity);
      const adminUserRepo = em.getRepository(BaseSysUserEntity);
      const roleRepo = em.getRepository(BaseSysRoleEntity);
      const userRoleRepo = em.getRepository(BaseSysUserRoleEntity);

      let appUser = await appUserRepo.findOneBy({ id: Equal(appUserId) });
      if (!appUser) {
        return;
      }

      // 仅当用户未选择租户（tenantId 为空）且配置了默认租户时，才回写；用户登录时已选租户则保留
      const hasSelectedTenant =
        appUser.tenantId != null && !Number.isNaN(Number(appUser.tenantId));
      if (
        !hasSelectedTenant &&
        config.defaultTenantIdForAppUser != null
      ) {
        await appUserRepo.update(
          { id: Equal(appUserId) },
          { tenantId: config.defaultTenantIdForAppUser }
        );
        appUser = (await appUserRepo.findOneBy({ id: Equal(appUserId) }))!;
      }

      let bind = await bindRepo.findOneBy({ appUserId: Equal(appUserId) });
      let adminUser: BaseSysUserEntity | null = null;

      // 已绑定优先复用
      if (bind) {
        adminUser = await adminUserRepo.findOneBy({ id: Equal(bind.adminUserId) });
      }

      // 未绑定时，按手机号复用后台账号（可配置）
      if (!adminUser && config.autoBindByPhone && appUser.phone) {
        const matchedByPhone = await this.findAdminUserByPhone(
          em,
          appUser.phone,
          appUser.tenantId ?? null
        );
        if (matchedByPhone) {
          const bindByAdmin = await bindRepo.findOneBy({
            adminUserId: Equal(matchedByPhone.id)
          });
          if (!bindByAdmin || bindByAdmin.appUserId === appUser.id) {
            adminUser = matchedByPhone;
          }
        }
      }

      // 仍未找到则创建后台账号
      if (!adminUser) {
        adminUser = await this.createAdminUser(em, appUser);
      } else if (config.updateAdminProfileOnLogin) {
        await this.updateAdminProfileByAppUser(em, adminUser.id, appUser);
      }

      bind = await bindRepo.findOneBy({ appUserId: Equal(appUser.id) });
      if (!bind) {
        await bindRepo.save({
          appUserId: appUser.id,
          adminUserId: adminUser.id,
          tenantId: appUser.tenantId ?? null,
          remark: 'auto-sync'
        });
      } else if (bind.adminUserId !== adminUser.id) {
        bind.adminUserId = adminUser.id;
        bind.tenantId = appUser.tenantId ?? null;
        bind.remark = bind.remark || 'auto-sync';
        await bindRepo.save(bind);
      }

      await this.appendDefaultRoles(em, adminUser.id, appUser.tenantId ?? null, config);
    });
  }

  /**
   * 按手机号查询后台账号（同租户）
   */
  private async findAdminUserByPhone(
    em: EntityManager,
    phone: string,
    tenantId: number | null
  ) {
    const repo = em.getRepository(BaseSysUserEntity);
    if (tenantId == null) {
      return repo.findOne({
        where: {
          phone: Equal(phone),
          tenantId: IsNull()
        },
        order: {
          id: 'ASC'
        }
      });
    }
    return repo.findOne({
      where: {
        phone: Equal(phone),
        tenantId: Equal(tenantId)
      },
      order: {
        id: 'ASC'
      }
    });
  }

  /**
   * 创建后台账号（默认不可直接密码登录）
   */
  private async createAdminUser(em: EntityManager, appUser: UserInfoEntity) {
    const config = this.getSyncConfig();
    const adminUserRepo = em.getRepository(BaseSysUserEntity);
    const username = await this.generateUniqueUsername(
      em,
      appUser.id,
      appUser.tenantId ?? null,
      config.usernamePrefix
    );

    const password = md5(uuid());
    const user = adminUserRepo.create({
      username,
      password,
      passwordV: 1,
      name: appUser.nickName || appUser.phone || `用户${appUser.id}`,
      nickName: appUser.nickName || appUser.phone || `用户${appUser.id}`,
      headImg: appUser.avatarUrl || null,
      phone: appUser.phone || null,
      email: null,
      remark: 'auto-sync-from-app',
      status: 1,
      departmentId: null,
      userId: 1,
      socketId: null,
      tenantId: appUser.tenantId ?? null
    });

    return adminUserRepo.save(user);
  }

  /**
   * 用C端资料同步后台账号基础信息
   */
  private async updateAdminProfileByAppUser(
    em: EntityManager,
    adminUserId: number,
    appUser: UserInfoEntity
  ) {
    await em.getRepository(BaseSysUserEntity).update(
      { id: Equal(adminUserId) },
      {
        name: appUser.nickName || appUser.phone || `用户${appUser.id}`,
        nickName: appUser.nickName || appUser.phone || `用户${appUser.id}`,
        headImg: appUser.avatarUrl || null,
        phone: appUser.phone || null
      }
    );
  }

  /**
   * 追加默认角色（不覆盖已有角色）
   */
  private async appendDefaultRoles(
    em: EntityManager,
    adminUserId: number,
    tenantId: number | null,
    config: { defaultRoleLabels: string[] }
  ) {
    const labels = config.defaultRoleLabels || [];
    if (labels.length === 0) return;

    const roleRepo = em.getRepository(BaseSysRoleEntity);
    const userRoleRepo = em.getRepository(BaseSysUserRoleEntity);

    const where =
      tenantId == null
        ? {
            label: In(labels),
            tenantId: IsNull()
          }
        : {
            label: In(labels),
            tenantId: Equal(tenantId)
          };

    const roles = await roleRepo.find({
      where
    });

    if (roles.length === 0) return;

    const exists = await userRoleRepo.findBy({
      userId: Equal(adminUserId)
    });
    const existsSet = new Set(exists.map(e => e.roleId));

    const adds = roles
      .filter(e => !existsSet.has(e.id))
      .map(e => {
        return {
          userId: adminUserId,
          roleId: e.id,
          tenantId
        };
      });

    if (adds.length > 0) {
      await userRoleRepo.save(adds);
    }
  }

  /**
   * 默认用户名生成规则：{prefix}{appUserId}[_{n}]
   */
  private async generateUniqueUsername(
    em: EntityManager,
    appUserId: number,
    tenantId: number | null,
    prefix: string
  ) {
    const repo = em.getRepository(BaseSysUserEntity);
    const prefixVal = prefix || 'mini_u_';
    const base = `${prefixVal}${appUserId}`;

    for (let i = 0; i < 100; i++) {
      const username = i === 0 ? base : `${base}_${i}`;
      const where =
        tenantId == null
          ? {
              username: Equal(username),
              tenantId: IsNull()
            }
          : {
              username: Equal(username),
              tenantId: Equal(tenantId)
            };
      const exists = await repo.findOneBy(where);
      if (!exists) {
        return username;
      }
    }

    return `${base}_${Date.now()}`;
  }
}
