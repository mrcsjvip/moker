import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../base/entity/base';

/**
 * 库存
 */
@Entity('inventory_info')
export class InventoryEntity extends BaseEntity {
  @Index()
  @Column({ comment: '物料ID' })
  materialId: number;

  @Index()
  @Column({ comment: '门店ID', nullable: true })
  storeId: number;

  @Column({ comment: '库存数量', default: 0 })
  quantity: number;
}
