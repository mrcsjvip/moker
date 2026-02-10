import { Column, Entity, Index } from 'typeorm';
import { BaseEntity, transformerTime } from '../../base/entity/base';

/**
 * 审计日志
 */
@Entity('audit_log')
export class AuditLogEntity extends BaseEntity {
  @Index()
  @Column({ comment: '操作人ID', nullable: true })
  operatorId: number;

  @Index()
  @Column({ comment: '操作模块', nullable: true })
  module: string;

  @Column({ comment: '操作类型', nullable: true })
  action: string;

  @Column({ comment: '目标ID', nullable: true })
  targetId: number;

  @Column({ comment: '详情', nullable: true, type: 'text' })
  detail: string;

  @Column({
    comment: '操作时间',
    type: 'varchar',
    transformer: transformerTime,
  })
  actionTime: Date;
}
