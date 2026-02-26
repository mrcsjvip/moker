import { CoolController, BaseController } from '@cool-midway/core';
import { Body, Get, Inject, Post, Query } from '@midwayjs/core';
import { AppointmentMyListService } from '../../service/my_list';

/**
 * C端-我的预约
 */
@CoolController({ prefix: '/app/appointment/my', api: [] })
export class AppAppointmentMyController extends BaseController {
  @Inject()
  myListService: AppointmentMyListService;

  @Get('/list', { summary: '我的预约列表' })
  async listMine(@Query('tab') tab: string) {
    return this.ok(
      await this.myListService.list(tab == null || tab === '' ? 'all' : String(tab))
    );
  }

  @Get('/info', { summary: '预约详情' })
  async infoDetail(@Query('id') id: string) {
    const detail = await this.myListService.getDetail(Number(id) || 0);
    if (detail == null) return this.fail('预约不存在或无权查看');
    return this.ok(detail);
  }

  @Post('/submit', { summary: '提交预约' })
  async submit(@Body() body: any) {
    const { id } = await this.myListService.submit(body);
    return this.ok({ id });
  }

  @Post('/confirm', { summary: '确认预约' })
  async confirm(@Body('id') id: number) {
    await this.myListService.confirm(Number(id) || 0);
    return this.ok();
  }

  @Post('/cancel', { summary: '取消预约' })
  async cancel(@Body('id') id: number) {
    await this.myListService.cancel(Number(id) || 0);
    return this.ok();
  }
}
