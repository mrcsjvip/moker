import { Column, Entity, Index } from 'typeorm';
import { BaseEntity, transformerTime } from '../../base/entity/base';

/**
 * 库存流水
 */
@Entity('inventory_log')
export class InventoryLogEntity extends BaseEntity {
  @Index()
  @Column({ comment: '物料ID' })
  materialId: number;

  @Column({ comment: '门店ID', nullable: true })
  storeId: number;

  @Column({ comment: '数量变化' })
  changeQty: number;

  @Column({ comment: '类型 0-入库 1-出库', default: 0 })
  type: number;

  @Column({ comment: '关联单号', nullable: true })
  refNo: string;

  @Column({
    comment: '发生时间',
    type: 'varchar',
    transformer: transformerTime,
  })
  happenTime: Date;
}
