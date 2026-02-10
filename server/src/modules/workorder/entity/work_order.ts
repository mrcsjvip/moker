import { Column, Entity, Index } from 'typeorm';
import { BaseEntity, transformerTime } from '../../base/entity/base';

/**
 * 工单
 */
@Entity('work_order')
export class WorkOrderEntity extends BaseEntity {
  @Index()
  @Column({ comment: '预约ID', nullable: true })
  appointmentId: number;

  @Index()
  @Column({ comment: '客户ID' })
  customerId: number;

  @Column({ comment: '门店ID', nullable: true })
  storeId: number;

  @Column({ comment: '车辆ID', nullable: true })
  vehicleId: number;

  @Column({ comment: '服务ID', nullable: true })
  serviceId: number;

  @Column({ comment: '技师ID', nullable: true })
  technicianId: number;

  @Column({ comment: '状态 0-已创建 1-施工中 2-已完成 3-归档', default: 0 })
  status: number;

  @Column({
    comment: '签到时间',
    type: 'varchar',
    nullable: true,
    transformer: transformerTime,
  })
  checkInTime: Date;

  @Column({ comment: '备注', nullable: true })
  remark: string;
}
