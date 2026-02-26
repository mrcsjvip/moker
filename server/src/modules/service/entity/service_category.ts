import { BaseEntity } from '../../base/entity/base';
import { Column, Entity, Index } from 'typeorm';

/**
 * 服务分类（全车贴膜、局部贴膜、隐形车衣、改色膜、窗膜等，后台可配置）
 */
@Entity('service_category')
export class ServiceCategoryEntity extends BaseEntity {
  @Index()
  @Column({ comment: '分类名称' })
  name: string;

  @Column({ comment: '排序号，越小越靠前', default: 0 })
  orderNum: number;
}
