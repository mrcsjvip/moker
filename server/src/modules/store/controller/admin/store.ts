import { CoolController, BaseController } from '@cool-midway/core';
import { StoreEntity } from '../../entity/store';

/**
 * 门店管理
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: StoreEntity,
  pageQueryOp: {
    keyWordLikeFields: ['name', 'city'],
  },
})
export class AdminStoreController extends BaseController {}
