import { Column, Entity, Index } from 'typeorm';
import { BaseEntity, transformerTime } from '../../base/entity/base';

/**
 * 工单步骤
 */
@Entity('work_order_step')
export class WorkOrderStepEntity extends BaseEntity {
  @Index()
  @Column({ comment: '工单ID' })
  workOrderId: number;

  @Column({ comment: '步骤名称' })
  name: string;

  @Column({ comment: '状态 0-待完成 1-已完成', default: 0 })
  status: number;

  @Column({
    comment: '完成时间',
    type: 'varchar',
    nullable: true,
    transformer: transformerTime,
  })
  finishedTime: Date;
}
