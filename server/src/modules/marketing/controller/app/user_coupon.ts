import { CoolController, BaseController } from '@cool-midway/core';
import { Body, Get, Inject, Post, Query } from '@midwayjs/core';
import { MarketingUserCouponService } from '../../service/user_coupon';

/**
 * C端-我的优惠券：列表、领取
 */
@CoolController({ prefix: '/app/marketing/userCoupon', api: [] })
export class AppMarketingUserCouponController extends BaseController {
  @Inject()
  userCouponService: MarketingUserCouponService;

  @Get('/available', { summary: '可领取的优惠券列表' })
  async available() {
    return this.ok(await this.userCouponService.availableList());
  }

  @Get('/list', { summary: '我的优惠券列表' })
  async list(@Query('status') status?: number) {
    return this.ok(await this.userCouponService.myList(status != null ? Number(status) : undefined));
  }

  @Post('/receive', { summary: '领取优惠券' })
  async receive(@Body('couponId') couponId: number) {
    return this.ok(await this.userCouponService.receive(Number(couponId)));
  }
}
