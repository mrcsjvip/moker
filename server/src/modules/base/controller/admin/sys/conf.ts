import { Provide } from '@midwayjs/core';
import { CoolController, BaseController } from '@cool-midway/core';
import { BaseSysConfEntity } from '../../../entity/sys/conf';

/**
 * 系统配置（按租户隔离，后台管理）
 */
@Provide()
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'page'],
  entity: BaseSysConfEntity,
  pageQueryOp: {
    fieldEq: ['tenantId', 'cKey'],
    keyWordLikeFields: ['cKey', 'cValue'],
  },
})
export class BaseSysConfController extends BaseController {}
