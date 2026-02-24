import { CoolController, BaseController } from '@cool-midway/core';
import { Body, Get, Inject, Post, Query } from '@midwayjs/core';
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

  @Get('/info', { summary: '车辆详情' })
  async info(@Query('id') id: string) {
    const detail = await this.myListService.info(Number(id) || 0);
    if (detail == null) return this.fail('车辆不存在或无权查看');
    return this.ok(detail);
  }

  @Post('/add', { summary: '添加车辆' })
  async add(@Body() body: any) {
    const { id } = await this.myListService.add(body);
    return this.ok({ id });
  }

  @Post('/update', { summary: '更新车辆' })
  async update(@Body('id') id: number, @Body() body: any) {
    await this.myListService.update(Number(id) || 0, body);
    return this.ok();
  }

  @Post('/delete', { summary: '删除车辆' })
  async delete(@Body('id') id: number) {
    await this.myListService.delete(Number(id) || 0);
    return this.ok();
  }
}
