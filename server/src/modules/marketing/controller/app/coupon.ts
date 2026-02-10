import { CoolController, BaseController } from '@cool-midway/core';
import { CouponEntity } from '../../entity/coupon';

/**
 * 优惠券（C端）
 */
@CoolController({
  api: ['list', 'page', 'info'],
  entity: CouponEntity,
  listQueryOp: {
    fieldEq: ['status'],
  },
})
export class AppCouponController extends BaseController {}
