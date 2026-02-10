import { Provide } from '@midwayjs/core';
import { CoolController, BaseController } from '@cool-midway/core';
import { BaseSysTenantEntity } from '../../../entity/sys/tenant';
import { BaseSysTenantService } from '../../../service/sys/tenant';

/**
 * 租户管理（仅超级管理员可访问，需在角色权限中仅分配给 admin 角色）
 */
@Provide()
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: BaseSysTenantEntity,
  service: BaseSysTenantService,
  pageQueryOp: {
    keyWordLikeFields: ['name', 'remark'],
  },
})
export class BaseSysTenantController extends BaseController {}
