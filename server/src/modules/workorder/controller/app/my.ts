import { CoolController, BaseController } from '@cool-midway/core';
import { Get, Inject } from '@midwayjs/core';
import { WorkOrderMyListService } from '../../service/my_list';

/**
 * C端-我的工单/质保
 */
@CoolController({ prefix: '/app/workorder/my', api: [] })
export class AppWorkOrderMyController extends BaseController {
  @Inject()
  myListService: WorkOrderMyListService;

  @Get('/list', { summary: '我的工单列表' })
  async listMine() {
    return this.ok(await this.myListService.list());
  }
}
