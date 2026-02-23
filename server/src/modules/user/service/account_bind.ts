import { BaseService, CoolCommException } from '@cool-midway/core';
import { Inject, Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Context } from '@midwayjs/koa';
import { Equal, In, Repository } from 'typeorm';
import { BaseSysRoleEntity } from '../../base/entity/sys/role';
import { BaseSysUserEntity } from '../../base/entity/sys/user';
import { BaseSysUserRoleEntity } from '../../base/entity/sys/user_role';
import { UserAccountBindEntity } from '../entity/account_bind';
import { UserInfoEntity } from '../entity/info';

export type AppRoleAccess = {
  isEmployee: boolean;
  isManager: boolean;
  roleLabels: string[];
};

/**
 * C端用户与后台账号绑定
 */
@Provide()
export class UserAccountBindService extends BaseService {
  @InjectEntityModel(UserAccountBindEntity)
  userAccountBindEntity: Repository<UserAccountBindEntity>;

  @InjectEntityModel(UserInfoEntity)
  userInfoEntity: Repository<UserInfoEntity>;

  @InjectEntityModel(BaseSysUserEntity)
  baseSysUserEntity: Repository<BaseSysUserEntity>;

  @InjectEntityModel(BaseSysUserRoleEntity)
  baseSysUserRoleEntity: Repository<BaseSysUserRoleEntity>;

  @InjectEntityModel(BaseSysRoleEntity)
  baseSysRoleEntity: Repository<BaseSysRoleEntity>;

  @Inject()
  ctx: Context;

  /**
   * 创建或更新绑定关系
   */
  async saveBind(appUserId: number, adminUserId: number, remark?: string) {
    const appUser = await this.userInfoEntity.findOneBy({
      id: Equal(appUserId),
    });
    if (!appUser) {
      throw new CoolCommException('C端用户不存在');
    }

    const adminUser = await this.baseSysUserEntity.findOneBy({
      id: Equal(adminUserId),
    });
    if (!adminUser) {
      throw new CoolCommException('后台账号不存在');
    }

    // 多租户下强制同租户绑定，避免跨租户越权
    const appTenantId = appUser.tenantId ?? null;
    const adminTenantId = adminUser.tenantId ?? null;
    if (appTenantId !== adminTenantId) {
      throw new CoolCommException('不允许跨租户绑定账号');
    }

    // 租户管理员只能操作本租户数据
    const currentTenantId = this.ctx.admin?.tenantId ?? null;
    if (currentTenantId != null && currentTenantId !== appTenantId) {
      throw new CoolCommException('无权限操作其他租户的数据');
    }

    const oldByApp = await this.userAccountBindEntity.findOneBy({
      appUserId: Equal(appUserId),
    });
    const oldByAdmin = await this.userAccountBindEntity.findOneBy({
      adminUserId: Equal(adminUserId),
    });

    if (oldByAdmin && oldByAdmin.appUserId !== appUserId) {
      throw new CoolCommException('该后台账号已绑定其他C端用户');
    }

    const payload = {
      appUserId,
      adminUserId,
      remark: remark || null,
      tenantId: appTenantId,
    };

    if (oldByApp) {
      await this.userAccountBindEntity.update({ id: oldByApp.id }, payload);
      return this.userAccountBindEntity.findOneBy({ id: Equal(oldByApp.id) });
    }

    return this.userAccountBindEntity.save(payload);
  }

  /**
   * 解除绑定
   */
  async unbindByAppUserId(appUserId: number) {
    const bind = await this.userAccountBindEntity.findOneBy({
      appUserId: Equal(appUserId),
    });
    if (!bind) {
      return;
    }
    const currentTenantId = this.ctx.admin?.tenantId ?? null;
    if (
      currentTenantId != null &&
      currentTenantId !== (bind.tenantId ?? null)
    ) {
      throw new CoolCommException('无权限操作其他租户的数据');
    }
    await this.userAccountBindEntity.delete({ id: bind.id });
  }

  /**
   * 查询绑定信息
   */
  async getBindByAppUserId(appUserId: number) {
    return this.userAccountBindEntity.findOneBy({
      appUserId: Equal(appUserId),
    });
  }

  /**
   * 根据C端用户ID解析角色能力
   */
  async getRoleAccessByAppUserId(appUserId: number): Promise<AppRoleAccess> {
    const bind = await this.userAccountBindEntity.findOneBy({
      appUserId: Equal(appUserId),
    });

    if (!bind) {
      return {
        isEmployee: false,
        isManager: false,
        roleLabels: [],
      };
    }

    const userRoles = await this.baseSysUserRoleEntity.findBy({
      userId: Equal(bind.adminUserId),
    });
    const roleIds = userRoles.map(e => e.roleId);

    if (roleIds.length === 0) {
      return {
        isEmployee: false,
        isManager: false,
        roleLabels: [],
      };
    }

    const roles = await this.baseSysRoleEntity.findBy({ id: In(roleIds) });
    const roleLabels = roles
      .map(e => (e.label || '').trim().toLowerCase())
      .filter(Boolean);

    const isManager = roleLabels.includes('mini_manager');
    const isEmployee = isManager || roleLabels.includes('mini_employee');

    return {
      isEmployee,
      isManager,
      roleLabels,
    };
  }
}
