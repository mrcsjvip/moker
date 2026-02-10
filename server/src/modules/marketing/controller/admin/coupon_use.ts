import { CoolController, BaseController } from '@cool-midway/core';
import { CouponUseEntity } from '../../entity/coupon_use';

/**
 * 优惠券使用记录
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: CouponUseEntity,
  pageQueryOp: {
    fieldEq: ['couponId', 'customerId'],
  },
})
export class AdminCouponUseController extends BaseController {}
