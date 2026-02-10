import { CoolController, BaseController } from '@cool-midway/core';
import { VehicleEntity } from '../../entity/vehicle';

/**
 * 车辆管理
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: VehicleEntity,
  pageQueryOp: {
    keyWordLikeFields: ['plateNumber', 'brand', 'model'],
    fieldEq: ['customerId'],
  },
})
export class AdminVehicleController extends BaseController {}
