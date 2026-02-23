import { CoolController, BaseController } from '@cool-midway/core';
import { Get, Inject } from '@midwayjs/core';
import { VehicleMyListService } from '../../service/my_list';

/**
 * C端-我的车辆
 */
@CoolController('/app/vehicle/my', {
  api: [],
  entity: null,
})
export class AppVehicleMyController extends BaseController {
  @Inject()
  myListService: VehicleMyListService;

  @Get('/list', { summary: '我的车辆列表' })
  async list() {
    return this.ok(await this.myListService.list());
  }
}
