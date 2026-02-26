import { CoolController, BaseController } from '@cool-midway/core';
import { ServiceEntity } from '../../entity/service';

/**
 * 服务项目（C端）
 */
@CoolController({
  api: ['list', 'page', 'info'],
  entity: ServiceEntity,
  listQueryOp: {
    keyWordLikeFields: ['name'],
    fieldEq: ['categoryId'],
  },
})
export class AppServiceController extends BaseController {}
