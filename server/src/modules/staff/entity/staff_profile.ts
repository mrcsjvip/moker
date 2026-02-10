import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../base/entity/base';

/**
 * 员工档案
 */
@Entity('staff_profile')
export class StaffProfileEntity extends BaseEntity {
  @Index()
  @Column({ comment: '系统用户ID' })
  userId: number;

  @Column({ comment: '岗位', nullable: true })
  position: string;

  @Column({ comment: '星级', default: 0 })
  starLevel: number;

  @Column({ comment: '提成规则', nullable: true })
  commissionRule: string;
}
