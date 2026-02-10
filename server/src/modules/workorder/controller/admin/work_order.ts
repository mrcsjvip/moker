import { CoolController, BaseController } from '@cool-midway/core';
import { WorkOrderEntity } from '../../entity/work_order';

/**
 * 工单管理
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: WorkOrderEntity,
  pageQueryOp: {
    fieldEq: ['customerId', 'storeId', 'status', 'technicianId'],
  },
})
export class AdminWorkOrderController extends BaseController {}
