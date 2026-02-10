import { CoolController, BaseController } from '@cool-midway/core';
import { StoreEntity } from '../../entity/store';

/**
 * 门店列表（C端/员工端）
 */
@CoolController({
  api: ['list', 'page', 'info'],
  entity: StoreEntity,
  listQueryOp: {
    keyWordLikeFields: ['name', 'city'],
  },
})
export class AppStoreController extends BaseController {}
