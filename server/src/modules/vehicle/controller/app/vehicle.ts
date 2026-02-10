import { CoolController, BaseController } from '@cool-midway/core';
import { VehicleEntity } from '../../entity/vehicle';

/**
 * 车辆管理（C端）
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: VehicleEntity,
  pageQueryOp: {
    fieldEq: ['customerId'],
  },
})
export class AppVehicleController extends BaseController {}
