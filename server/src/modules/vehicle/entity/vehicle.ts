import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../base/entity/base';

/**
 * 车辆
 */
@Entity('vehicle_info')
export class VehicleEntity extends BaseEntity {
  @Index()
  @Column({ comment: '客户ID' })
  customerId: number;

  @Index()
  @Column({ comment: '车牌号' })
  plateNumber: string;

  @Column({ comment: '品牌', nullable: true })
  brand: string;

  @Column({ comment: '车型', nullable: true })
  model: string;

  @Column({ comment: 'VIN', nullable: true })
  vin: string;
}
