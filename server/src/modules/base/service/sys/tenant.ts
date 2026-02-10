import { Inject, Provide } from '@midwayjs/core';
import { BaseService, CoolCommException } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { BaseSysTenantEntity } from '../../entity/sys/tenant';
import { BaseSysDepartmentEntity } from '../../entity/sys/department';
import { BaseSysRoleEntity } from '../../entity/sys/role';
import { BaseSysUserEntity } from '../../entity/sys/user';
import { BaseSysUserRoleEntity } from '../../entity/sys/user_role';
import { BaseSysRoleMenuEntity } from '../../entity/sys/role_menu';
import { BaseSysRoleDepartmentEntity } from '../../entity/sys/role_department';
import { BaseSysMenuEntity } from '../../entity/sys/menu';
import { noTenant } from '../../db/tenant';
import * as md5 from 'md5';
import * as _ from 'lodash';
import * as moment from 'moment';
import { BaseSysPermsService } from './perms';

const DEFAULT_DEPT_NAME = '默认部门';
const DEFAULT_ROLE_NAME = '总部管理员';
const DEFAULT_ROLE_LABEL_PREFIX = 'tenant_admin_';
const DEFAULT_ADMIN_USERNAME = 'admin';
const DEFAULT_ADMIN_PASSWORD = '123456';

/**
 * 租户（仅超级管理员可管理）
 * 新增租户时自动初始化：默认部门、默认菜单权限、总部管理员角色、总部管理员用户
 */
@Provide()
export class BaseSysTenantService extends BaseService {
  @InjectEntityModel(BaseSysTenantEntity)
  baseSysTenantEntity: Repository<BaseSysTenantEntity>;

  @InjectEntityModel(BaseSysDepartmentEntity)
  baseSysDepartmentEntity: Repository<BaseSysDepartmentEntity>;

  @InjectEntityModel(BaseSysRoleEntity)
  baseSysRoleEntity: Repository<BaseSysRoleEntity>;

  @InjectEntityModel(BaseSysUserEntity)
  baseSysUserEntity: Repository<BaseSysUserEntity>;

  @InjectEntityModel(BaseSysUserRoleEntity)
  baseSysUserRoleEntity: Repository<BaseSysUserRoleEntity>;

  @InjectEntityModel(BaseSysRoleMenuEntity)
  baseSysRoleMenuEntity: Repository<BaseSysRoleMenuEntity>;

  @InjectEntityModel(BaseSysRoleDepartmentEntity)
  baseSysRoleDepartmentEntity: Repository<BaseSysRoleDepartmentEntity>;

  @InjectEntityModel(BaseSysMenuEntity)
  baseSysMenuEntity: Repository<BaseSysMenuEntity>;

  @Inject()
  baseSysPermsService: BaseSysPermsService;

  @Inject()
  ctx: any;

  /**
   * 新增租户并初始化：默认部门、默认菜单、总部管理员角色、总部管理员用户
   * 管理员登录账号默认使用手机号码；需传 phone（手机号）、adminPassword（密码）
   * 初始化与租户写入在同一事务中，任一步失败则整体回滚，租户不会添加成功
   */
  async add(param: Record<string, any>): Promise<{ id: number }> {
    const phone = _.trim(String(param.phone ?? ''));
    const adminUsername =
      phone || _.trim(param.adminUsername) || DEFAULT_ADMIN_USERNAME;
    const adminPassword = param.adminPassword || DEFAULT_ADMIN_PASSWORD;
    const adminName = _.trim(param.adminName) || param.name || DEFAULT_ROLE_NAME;

    if (!adminUsername) {
      throw new CoolCommException('请填写手机号码，将作为租户管理员登录账号');
    }
    if (adminPassword.length < 6) {
      throw new CoolCommException('默认管理员密码不能少于6位');
    }

    const tenantParam = {
      name: param.name,
      expireDate: param.expireDate ?? null,
      remark: param.remark ?? null,
    };
    const now = this.getTimeStr();
    let tenantId: number;
    let defaultUserId: number;

    await noTenant(this.ctx, async () => {
      await this.baseSysTenantEntity.manager.transaction(async em => {
        const tenantRepo = em.getRepository(BaseSysTenantEntity);
        const deptRepo = em.getRepository(BaseSysDepartmentEntity);
        const menuRepo = em.getRepository(BaseSysMenuEntity);
        const roleRepo = em.getRepository(BaseSysRoleEntity);
        const roleMenuRepo = em.getRepository(BaseSysRoleMenuEntity);
        const roleDeptRepo = em.getRepository(BaseSysRoleDepartmentEntity);
        const userRepo = em.getRepository(BaseSysUserEntity);
        const userRoleRepo = em.getRepository(BaseSysUserRoleEntity);

        // 1. 插入租户（租户表自身 tenantId 为 null）
        const tenantRow = {
          ...tenantParam,
          createTime: now,
          updateTime: now,
          tenantId: null,
        };
        const tenantInsert = await tenantRepo.save(tenantRow as any);
        tenantId = tenantInsert.id;

        // 2. 查询菜单（在设置 tenantId 前执行，避免被租户条件过滤）
        const menus = await menuRepo.find({
          select: ['id'],
          order: { id: 'ASC' },
        });
        const menuIdList = menus.map(m => m.id);
        if (_.isEmpty(menuIdList)) {
          throw new CoolCommException('系统暂无菜单，请先初始化菜单');
        }

        // 3. 临时将上下文租户设为新建的 base_sys_tenant.id，使 TenantSubscriber 在后续 INSERT 时写入正确 tenantId
        const prevTenantId = this.ctx.admin?.tenantId;
        this.ctx.admin = this.ctx.admin || {};
        this.ctx.admin.tenantId = tenantId;
        try {
          // 4. 默认部门（tenantId = base_sys_tenant.id）
          const deptRow = {
            name: DEFAULT_DEPT_NAME,
            parentId: null,
            orderNum: 0,
            userId: null,
            createTime: now,
            updateTime: now,
            tenantId,
          };
          const deptInsert = await deptRepo.save(deptRow as any);
          const defaultDeptId = deptInsert.id;

          // 5. 总部管理员角色
          const roleRow = {
            userId: '0',
            name: `${DEFAULT_ROLE_NAME}-${tenantId}`,
            label: `${DEFAULT_ROLE_LABEL_PREFIX}${tenantId}`,
            remark: '租户默认管理员角色',
            relevance: false,
            menuIdList,
            departmentIdList: [defaultDeptId],
            createTime: now,
            updateTime: now,
            tenantId,
          };
          const roleInsert = await roleRepo.save(roleRow as any);
          const defaultRoleId = roleInsert.id;

          // 6. 角色-菜单
          for (const menuId of menuIdList) {
            await roleMenuRepo.save({
              roleId: defaultRoleId,
              menuId,
              createTime: now,
              updateTime: now,
              tenantId,
            } as any);
          }

          // 7. 角色-部门
          await roleDeptRepo.save({
            roleId: defaultRoleId,
            departmentId: defaultDeptId,
            createTime: now,
            updateTime: now,
            tenantId,
          } as any);

          // 8. 检查同一租户下用户名是否已存在
          const exists = await userRepo.findOne({
            where: { username: adminUsername, tenantId },
          });
          if (exists) {
            throw new CoolCommException(
              `该租户下用户名「${adminUsername}」已存在，请更换默认管理员手机号`
            );
          }

          // 9. 总部管理员用户（tenantId = base_sys_tenant.id）
          const userRow = {
            departmentId: defaultDeptId,
            userId: null,
            name: adminName,
            username: adminUsername,
            password: md5(adminPassword),
            passwordV: 1,
            nickName: adminName,
            phone: phone || adminUsername,
            status: 1,
            createTime: now,
            updateTime: now,
            tenantId,
          };
          const userInsert = await userRepo.save(userRow as any);
          defaultUserId = userInsert.id;

          // 10. 用户-角色
          await userRoleRepo.save({
            userId: defaultUserId,
            roleId: defaultRoleId,
            createTime: now,
            updateTime: now,
            tenantId,
          } as any);

          // 11. 更新角色的 userId 为默认管理员
          await roleRepo.update(
            { id: defaultRoleId },
            { userId: String(defaultUserId) }
          );
        } finally {
          this.ctx.admin.tenantId = prevTenantId;
        }
      });
    });

    // 事务提交后刷新权限缓存
    await this.baseSysPermsService.refreshPerms(defaultUserId!);
    return { id: tenantId! };
  }

  private getTimeStr(): string {
    return moment().format('YYYY-MM-DD HH:mm:ss');
  }
}
