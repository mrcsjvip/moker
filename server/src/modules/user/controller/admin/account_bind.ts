import { CoolController, BaseController } from '@cool-midway/core';
import { Body, Get, Inject, Post, Query } from '@midwayjs/core';
import { UserAccountBindService } from '../../service/account_bind';

/**
 * C端用户与后台账号绑定管理
 */
@CoolController()
export class AdminUserAccountBindController extends BaseController {
  @Inject()
  userAccountBindService: UserAccountBindService;

  @Post('/save', { summary: '新增或更新绑定' })
  async save(
    @Body('appUserId') appUserId: number,
    @Body('adminUserId') adminUserId: number,
    @Body('remark') remark?: string
  ) {
    return this.ok(
      await this.userAccountBindService.saveBind(
        Number(appUserId),
        Number(adminUserId),
        remark
      )
    );
  }

  @Post('/unbind', { summary: '按C端用户ID解除绑定' })
  async unbind(@Body('appUserId') appUserId: number) {
    await this.userAccountBindService.unbindByAppUserId(Number(appUserId));
    return this.ok();
  }

  @Get('/bindInfo', { summary: '按C端用户ID获取绑定信息' })
  async bindInfo(@Query('appUserId') appUserId: number) {
    return this.ok(
      await this.userAccountBindService.getBindByAppUserId(Number(appUserId))
    );
  }

  @Get('/roleAccess', { summary: '获取C端用户角色能力' })
  async roleAccess(@Query('appUserId') appUserId: number) {
    return this.ok(
      await this.userAccountBindService.getRoleAccessByAppUserId(
        Number(appUserId)
      )
    );
  }
}
