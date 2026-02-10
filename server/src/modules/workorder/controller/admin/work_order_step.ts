import { CoolController, BaseController } from '@cool-midway/core';
import { WorkOrderStepEntity } from '../../entity/work_order_step';

/**
 * 工单步骤管理
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: WorkOrderStepEntity,
  pageQueryOp: {
    fieldEq: ['workOrderId', 'status'],
  },
})
export class AdminWorkOrderStepController extends BaseController {}
