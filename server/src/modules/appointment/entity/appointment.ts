import { Column, Entity, Index } from 'typeorm';
import { BaseEntity, transformerTime } from '../../base/entity/base';

/**
 * 预约
 */
@Entity('appointment_info')
export class AppointmentEntity extends BaseEntity {
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

  @Column({
    comment: '预约时间',
    type: 'varchar',
    transformer: transformerTime,
  })
  appointmentTime: Date;

  @Column({ comment: '状态 0-待确认 1-已确认 2-已取消 3-已完成', default: 0 })
  status: number;

  @Column({ comment: '备注', nullable: true })
  remark: string;
}
