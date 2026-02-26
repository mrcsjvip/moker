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

  @Column({ comment: '核销门店ID', nullable: true })
  storeId: number;

  @Column({ comment: '核销人（员工/店长）ID', nullable: true })
  operatorId: number;

  @Column({
    comment: '使用时间',
    type: 'varchar',
    transformer: transformerTime,
  })
  usedTime: Date;
}
