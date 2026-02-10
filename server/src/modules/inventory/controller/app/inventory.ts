import { CoolController, BaseController } from '@cool-midway/core';
import { InventoryEntity } from '../../entity/inventory';

/**
 * 库存（员工端）
 */
@CoolController({
  api: ['list', 'page', 'info'],
  entity: InventoryEntity,
  pageQueryOp: {
    fieldEq: ['materialId', 'storeId'],
  },
})
export class AppInventoryController extends BaseController {}
