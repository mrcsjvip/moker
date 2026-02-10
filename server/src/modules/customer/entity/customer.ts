import { Column, Entity, Index } from 'typeorm';
import { BaseEntity, transformerJson } from '../../base/entity/base';

/**
 * 客户（车主）
 */
@Entity('customer_info')
export class CustomerEntity extends BaseEntity {
  @Index()
  @Column({ comment: '姓名' })
  name: string;

  @Index()
  @Column({ comment: '手机号', length: 20 })
  phone: string;

  @Column({ comment: '关联用户ID', nullable: true })
  userId: number;

  @Column({
    comment: '客户标签',
    type: 'text',
    nullable: true,
    transformer: transformerJson,
  })
  tags: string[];

  @Column({ comment: '备注', nullable: true })
  remark: string;
}
