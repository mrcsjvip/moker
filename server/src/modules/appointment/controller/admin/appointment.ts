import { CoolController, BaseController } from '@cool-midway/core';
import { AppointmentEntity } from '../../entity/appointment';

/**
 * 预约管理
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: AppointmentEntity,
  pageQueryOp: {
    fieldEq: ['customerId', 'storeId', 'status'],
  },
})
export class AdminAppointmentController extends BaseController {}
