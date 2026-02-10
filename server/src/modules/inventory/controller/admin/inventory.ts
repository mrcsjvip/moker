import { CoolController, BaseController } from '@cool-midway/core';
import { InventoryEntity } from '../../entity/inventory';

/**
 * 库存管理
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: InventoryEntity,
  pageQueryOp: {
    fieldEq: ['materialId', 'storeId'],
  },
})
export class AdminInventoryController extends BaseController {}
