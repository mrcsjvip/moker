import { BaseEntity, transformerTime } from '../../base/entity/base';
import { Column, Entity, Index } from 'typeorm';

/**
 * 用户优惠券（领取后的券实例，用于核销）
 */
@Entity('marketing_user_coupon')
export class UserCouponEntity extends BaseEntity {
  @Index()
  @Column({ comment: '优惠券模板ID' })
  couponId: number;

  @Index()
  @Column({ comment: '客户ID' })
  customerId: number;

  @Index({ unique: true })
  @Column({ comment: '核销码（唯一，店长扫码/输入核销）', length: 32 })
  code: string;

  /** 状态 0-未使用 1-已使用 2-已过期 */
  @Column({ comment: '状态 0-未使用 1-已使用 2-已过期', default: 0 })
  status: number;

  @Column({
    comment: '领取时间',
    type: 'varchar',
    transformer: transformerTime,
  })
  receiveTime: Date;

  @Column({
    comment: '使用时间',
    type: 'varchar',
    nullable: true,
    transformer: transformerTime,
  })
  usedTime: Date;

  @Column({ comment: '核销门店ID', nullable: true })
  usedStoreId: number;

  @Column({ comment: '核销人（员工/店长）ID', nullable: true })
  usedOperatorId: number;
}
