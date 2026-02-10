import { Column, Entity, Index } from 'typeorm';
import { BaseEntity, transformerTime } from '../../base/entity/base';

/**
 * 优惠券使用记录
 */
@Entity('marketing_coupon_use')
export class CouponUseEntity extends BaseEntity {
  @Index()
  @Column({ comment: '优惠券ID' })
  couponId: number;

  @Index()
  @Column({ comment: '客户ID' })
  customerId: number;

  @Column({ comment: '工单ID', nullable: true })
  workOrderId: number;

  @Column({
    comment: '使用时间',
    type: 'varchar',
    transformer: transformerTime,
  })
  usedTime: Date;
}
