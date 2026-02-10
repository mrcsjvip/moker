import { Body, Inject, Post, Provide } from '@midwayjs/core';
import { CoolController, BaseController } from '@cool-midway/core';
import { BaseSysUserEntity } from '../../../entity/sys/user';
import { BaseSysUserService } from '../../../service/sys/user';

/**
 * 系统用户
 */
@Provide()
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: BaseSysUserEntity,
  service: BaseSysUserService,
  insertParam: ctx => {
    const param: { userId: number; tenantId?: number } = {
      userId: ctx.admin.userId,
    };
    // 租户管理员只能在本租户下添加用户，不能指定其他 tenantId
    if (ctx.admin.tenantId != null) {
      param.tenantId = ctx.admin.tenantId;
    }
    return param;
  },
})
export class BaseSysUserController extends BaseController {
  @Inject()
  baseSysUserService: BaseSysUserService;

  /**
   * 移动部门
   */
  @Post('/move', { summary: '移动部门' })
  async move(
    @Body('departmentId') departmentId: number,
    @Body('userIds') userIds: []
  ) {
    await this.baseSysUserService.move(departmentId, userIds);
    return this.ok();
  }
}
