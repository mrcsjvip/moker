import { Column, Entity, Index } from 'typeorm';
import { BaseEntity, transformerTime } from '../../base/entity/base';

/**
 * 优惠券
 */
@Entity('marketing_coupon')
export class CouponEntity extends BaseEntity {
  @Index()
  @Column({ comment: '券名称' })
  name: string;

  @Column({ comment: '券码', nullable: true })
  code: string;

  @Column({ comment: '类型 0-满减 1-折扣', default: 0 })
  type: number;

  @Column({ comment: '面值/折扣', type: 'decimal', precision: 10, scale: 2 })
  value: number;

  @Column({ comment: '最低消费', type: 'decimal', precision: 10, scale: 2, default: 0 })
  minSpend: number;

  @Column({
    comment: '开始时间',
    type: 'varchar',
    nullable: true,
    transformer: transformerTime,
  })
  startTime: Date;

  @Column({
    comment: '结束时间',
    type: 'varchar',
    nullable: true,
    transformer: transformerTime,
  })
  endTime: Date;

  @Column({ comment: '状态 0-停用 1-启用', default: 1 })
  status: number;
}
