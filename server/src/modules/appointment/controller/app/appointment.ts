import { CoolController, BaseController } from '@cool-midway/core';
import { AppointmentEntity } from '../../entity/appointment';

/**
 * 预约管理（C端）
 */
@CoolController({
  api: ['add', 'update', 'info', 'list', 'page'],
  entity: AppointmentEntity,
  pageQueryOp: {
    fieldEq: ['customerId', 'status'],
  },
})
export class AppAppointmentController extends BaseController {}
