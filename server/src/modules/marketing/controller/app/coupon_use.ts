import { CoolController, BaseController } from '@cool-midway/core';
import { CouponUseEntity } from '../../entity/coupon_use';

/**
 * 优惠券使用记录（C端）
 */
@CoolController({
  api: ['add', 'list', 'page'],
  entity: CouponUseEntity,
  pageQueryOp: {
    fieldEq: ['couponId', 'customerId'],
  },
})
export class AppCouponUseController extends BaseController {}
