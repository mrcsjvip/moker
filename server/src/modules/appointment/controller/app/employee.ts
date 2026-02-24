import { CoolController, BaseController } from '@cool-midway/core';
import { Body, Get, Inject, Post, Query } from '@midwayjs/core';
import { AppointmentEmployeeTaskService } from '../../service/employee_task';

/**
 * 员工端-今日任务、签到、统计
 */
@CoolController('/app/appointment/employee', {
  api: [],
  entity: null,
})
export class AppAppointmentEmployeeController extends BaseController {
  @Inject()
  employeeTaskService: AppointmentEmployeeTaskService;

  @Get('/todayList', { summary: '今日任务列表' })
  async todayList() {
    return this.ok(await this.employeeTaskService.getTodayTasks());
  }

  @Get('/todayStats', { summary: '今日统计' })
  async todayStats() {
    return this.ok(await this.employeeTaskService.getTodayStats());
  }

  @Get('/managerTodayList', { summary: '店长端今日预约列表（含技师）' })
  async managerTodayList() {
    return this.ok(await this.employeeTaskService.getManagerTodayList());
  }

  @Get('/managerAppointmentList', { summary: '店长端预约列表（分 tab）' })
  async managerAppointmentList(@Query('tab') tab: string) {
    return this.ok(
      await this.employeeTaskService.getManagerAppointmentList(
        tab == null || tab === '' ? 'all' : String(tab)
      )
    );
  }

  @Get('/detail', { summary: '预约详情（签到页）' })
  async detail(@Query('id') id: number) {
    return this.ok(
      await this.employeeTaskService.getAppointmentDetail(Number(id) || 0)
    );
  }

  @Post('/signIn', { summary: '到店签到' })
  async signIn(@Body('appointmentId') appointmentId: number) {
    return this.ok(
      await this.employeeTaskService.signIn(Number(appointmentId) || 0)
    );
  }

  @Post('/managerCancel', { summary: '店长取消预约' })
  async managerCancel(@Body('appointmentId') appointmentId: number) {
    await this.employeeTaskService.managerCancel(Number(appointmentId) || 0);
    return this.ok();
  }

  @Post('/managerReassign', { summary: '店长改派技师' })
  async managerReassign(
    @Body('appointmentId') appointmentId: number,
    @Body('technicianId') technicianId: number,
  ) {
    await this.employeeTaskService.managerReassign(
      Number(appointmentId) || 0,
      Number(technicianId) || 0,
    );
    return this.ok();
  }

  @Get('/technicianList', { summary: '店长端可选技师列表' })
  async technicianList() {
    return this.ok(await this.employeeTaskService.getTechnicianList());
  }

  @Get('/staffList', { summary: '店长端员工列表（含今日接单数）' })
  async staffList() {
    return this.ok(await this.employeeTaskService.getStaffList());
  }

  @Get('/managerStats', { summary: '店长端数据概览' })
  async managerStats() {
    return this.ok(await this.employeeTaskService.getManagerStats());
  }
}
