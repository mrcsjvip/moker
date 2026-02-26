import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../base/entity/base';

/**
 * 服务项目
 */
@Entity('service_item')
export class ServiceEntity extends BaseEntity {
  @Index()
  @Column({ comment: '服务分类ID', nullable: true })
  categoryId: number;

  @Index()
  @Column({ comment: '服务名称' })
  name: string;

  @Column({ comment: '指导价', type: 'decimal', precision: 10, scale: 2 })
  guidePrice: number;

  @Column({ comment: '施工时长(分钟)', default: 0 })
  duration: number;

  @Column({ comment: 'SOP', nullable: true, type: 'text' })
  sop: string;

  @Column({ comment: '描述', nullable: true })
  description: string;
}
