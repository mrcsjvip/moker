import { CoolController, BaseController } from '@cool-midway/core';
import { WorkOrderEntity } from '../../entity/work_order';

/**
 * 工单（C端/员工端）
 */
@CoolController({
  api: ['info', 'list', 'page', 'update'],
  entity: WorkOrderEntity,
  pageQueryOp: {
    fieldEq: ['customerId', 'technicianId', 'status'],
  },
})
export class AppWorkOrderController extends BaseController {}
