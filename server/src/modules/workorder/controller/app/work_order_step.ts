import { CoolController, BaseController } from '@cool-midway/core';
import { WorkOrderStepEntity } from '../../entity/work_order_step';

/**
 * 工单步骤（员工端）
 */
@CoolController({
  api: ['add', 'update', 'list', 'page'],
  entity: WorkOrderStepEntity,
  pageQueryOp: {
    fieldEq: ['workOrderId', 'status'],
  },
})
export class AppWorkOrderStepController extends BaseController {}
