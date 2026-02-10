import { CoolController, BaseController } from '@cool-midway/core';
import { InventoryLogEntity } from '../../entity/inventory_log';

/**
 * 库存流水
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: InventoryLogEntity,
  pageQueryOp: {
    fieldEq: ['materialId', 'storeId', 'type'],
  },
})
export class AdminInventoryLogController extends BaseController {}
