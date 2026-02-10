import { CoolController, BaseController } from '@cool-midway/core';
import { CouponEntity } from '../../entity/coupon';

/**
 * 优惠券管理
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: CouponEntity,
  pageQueryOp: {
    keyWordLikeFields: ['name', 'code'],
    fieldEq: ['status', 'type'],
  },
})
export class AdminCouponController extends BaseController {}
