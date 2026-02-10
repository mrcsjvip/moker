import { CoolController, BaseController } from '@cool-midway/core';
import { ServiceEntity } from '../../entity/service';

/**
 * 服务项目
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: ServiceEntity,
  pageQueryOp: {
    keyWordLikeFields: ['name'],
  },
})
export class AdminServiceController extends BaseController {}
