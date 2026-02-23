import { Provide, Inject, Get } from '@midwayjs/core';
import { CoolController, BaseController } from '@cool-midway/core';
import { Context } from '@midwayjs/koa';
import { BaseSysConfService, BUSINESS_CONF_KEYS } from '../../service/sys/conf';

/**
 * 业务配置（按租户隔离，app 端获取）
 */
@Provide()
@CoolController('/app/base/config', { api: [], entity: null })
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
}
