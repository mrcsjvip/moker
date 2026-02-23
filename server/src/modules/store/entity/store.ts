import { Column, Entity, Index } from 'typeorm';
import { BaseEntity, transformerJson } from '../../base/entity/base';

/**
 * 门店
 */
@Entity('store_info')
export class StoreEntity extends BaseEntity {
  @Index()
  @Column({ comment: '门店名称' })
  name: string;

  @Column({ comment: '城市' })
  city: string;

  @Column({ comment: '地址', nullable: true })
  address: string;

  @Column({ comment: '营业时间', nullable: true })
  businessHours: string;

  @Column({
    comment: '可预约时段',
    type: 'text',
    nullable: true,
    transformer: transformerJson,
  })
  bookingSlots: string[];

  @Column({ comment: '状态 0-停用 1-启用', default: 1 })
  status: number;

  @Column({ comment: '联系电话（前台）', length: 20, nullable: true })
  contactPhone: string;
}
