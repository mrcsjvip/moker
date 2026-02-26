import { CoolController, BaseController, CoolTag, TagTypes } from '@cool-midway/core';
import { Inject, Post } from '@midwayjs/core';
import { WorkOrderSeedService } from '../../service/seed';

/**
 * 测试数据：仅本地环境使用
 */
@CoolController({ prefix: '/admin/workorder/seed', api: [] })
export class AdminWorkOrderSeedController extends BaseController {
  @Inject()
  seedService: WorkOrderSeedService;

  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Post('/create', { summary: '创建测试工单/步骤' })
  async create() {
    if (process.env.NODE_ENV !== 'local') {
      return this.fail('仅本地环境可用');
    }
    return this.ok(await this.seedService.createSample());
  }
}
