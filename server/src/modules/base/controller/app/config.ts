import { Provide, Inject, Get } from '@midwayjs/core';
import { CoolController, BaseController, CoolTag, TagTypes } from '@cool-midway/core';
import { Context } from '@midwayjs/koa';
import {
  BaseSysConfService,
  BUSINESS_CONF_KEYS,
  APP_BANNER_DEFAULT,
  type AppBannerItem,
} from '../../service/sys/conf';

/**
 * 业务配置（按租户隔离，app 端获取）
 */
@Provide()
@CoolController({ prefix: '/app/base/config', api: [] })
export class BaseAppConfigController extends BaseController {
  @Inject()
  ctx: Context;

  @Inject()
  baseSysConfService: BaseSysConfService;

  @Get('/', { summary: '获取业务配置' })
  async get() {
    const tenantId = this.ctx.user?.tenantId;
    const list = Array.from(BUSINESS_CONF_KEYS);
    const values = await this.baseSysConfService.getValues(list, tenantId ?? undefined);
    return this.ok(values);
  }

  /**
   * 小程序轮播图列表（按租户，可不登录访问，用于首页）
   * @param tenantId 租户ID，不传则取全局配置
   */
  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Get('/banner', { summary: '小程序轮播图列表' })
  async banner() {
    const tenantId = this.ctx.query?.tenantId;
    const tid =
      tenantId != null && tenantId !== '' && !Number.isNaN(Number(tenantId))
        ? Number(tenantId)
        : this.ctx.user?.tenantId ?? undefined;
    const list = await this.baseSysConfService.getBannerList(tid);
    return this.ok(list);
  }
}
