import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../base/entity/base';

/**
 * 物料
 */
@Entity('material_info')
export class MaterialEntity extends BaseEntity {
  @Index()
  @Column({ comment: '物料名称' })
  name: string;

  @Index()
  @Column({ comment: 'SKU', nullable: true })
  sku: string;

  @Column({ comment: '单位', nullable: true })
  unit: string;

  @Column({ comment: '成本价', type: 'decimal', precision: 10, scale: 2 })
  costPrice: number;

  @Column({ comment: '销售价', type: 'decimal', precision: 10, scale: 2 })
  salePrice: number;

  @Column({ comment: '供应商', nullable: true })
  supplier: string;

  @Column({ comment: '库存预警', default: 0 })
  stockWarn: number;
}
