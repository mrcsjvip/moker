import { CoolController, BaseController } from '@cool-midway/core';
import { Body, Get, Inject, Post, Query } from '@midwayjs/core';
import { WorkOrderEmployeeListService } from '../../service/employee_list';

/**
 * 员工端-工单列表与详情
 */
@CoolController({ prefix: '/app/workorder/employee', api: [] })
export class AppWorkOrderEmployeeController extends BaseController {
  @Inject()
  employeeListService: WorkOrderEmployeeListService;

  @Get('/list', { summary: '进行中工单列表' })
  async list() {
    return this.ok(await this.employeeListService.list());
  }

  @Get('/stats', { summary: '员工本月统计' })
  async stats() {
    return this.ok(await this.employeeListService.stats());
  }

  @Get('/detail', { summary: '工单详情（执行页）' })
  async detail(@Query('id') id: number) {
    return this.ok(
      await this.employeeListService.detail(Number(id) || 0)
    );
  }

  @Post('/finishStep', { summary: '完成当前步骤' })
  async finishStep(@Body('workOrderId') workOrderId: number) {
    return this.ok(
      await this.employeeListService.finishStep(Number(workOrderId) || 0)
    );
  }

  @Post('/finishQuality', { summary: '全部完成提交质检' })
  async finishQuality(@Body('workOrderId') workOrderId: number) {
    return this.ok(
      await this.employeeListService.finishQuality(Number(workOrderId) || 0)
    );
  }
}
