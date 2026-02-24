import { Body, Get, Inject, Post } from '@midwayjs/core';
import { CoolController, BaseController } from '@cool-midway/core';
import { Context } from '@midwayjs/koa';
import { BaseSysConfService, type AppBannerItem } from '../../../../service/sys/conf';

/**
 * 小程序轮播图配置（按当前登录管理员租户）
 */
@CoolController({
  api: [],
  entity: null,
  prefix: '/admin/base/sys/appBanner',
})
export class BaseSysAppBannerController extends BaseController {
  @Inject()
  ctx: Context;

  @Inject()
  baseSysConfService: BaseSysConfService;

  @Get('/', { summary: '获取当前租户轮播图列表' })
  async get() {
    const tenantId = this.ctx.admin?.tenantId ?? null;
    const list = await this.baseSysConfService.getBannerList(tenantId);
    return this.ok(list);
  }

  @Post('/', { summary: '保存当前租户轮播图列表' })
  async set(@Body() body: { list?: AppBannerItem[] }) {
    const tenantId = this.ctx.admin?.tenantId ?? null;
    await this.baseSysConfService.setBannerList(tenantId, body?.list ?? []);
    return this.ok();
  }
}
