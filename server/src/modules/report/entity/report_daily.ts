import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../base/entity/base';

/**
 * 日报表
 */
@Entity('report_daily')
export class ReportDailyEntity extends BaseEntity {
  @Index()
  @Column({ comment: '门店ID', nullable: true })
  storeId: number;

  @Index()
  @Column({ comment: '日期' })
  reportDate: string;

  @Column({ comment: '营收', type: 'decimal', precision: 12, scale: 2 })
  revenue: number;

  @Column({ comment: '工单数量', default: 0 })
  workOrderCount: number;

  @Column({ comment: '客户数量', default: 0 })
  customerCount: number;
}
