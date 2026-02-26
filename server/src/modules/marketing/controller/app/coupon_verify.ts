import { CoolController, BaseController } from '@cool-midway/core';
import { Body, Inject, Post } from '@midwayjs/core';
import { MarketingUserCouponService } from '../../service/user_coupon';

/**
 * 员工/店长端-优惠券核销
 */
@CoolController({ prefix: '/app/marketing/couponVerify', api: [] })
export class AppMarketingCouponVerifyController extends BaseController {
  @Inject()
  userCouponService: MarketingUserCouponService;

  @Post('/verify', { summary: '核销优惠券（店长/员工扫码或输入券码）' })
  async verify(@Body('code') code: string, @Body('storeId') storeId?: number) {
    return this.ok(await this.userCouponService.verify(code || '', storeId != null ? Number(storeId) : undefined));
  }
}
