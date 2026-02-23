import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../base/entity/base';

/**
 * C端用户与后台账号绑定关系
 */
@Entity('user_account_bind')
export class UserAccountBindEntity extends BaseEntity {
  @Index({ unique: true })
  @Column({ comment: 'C端用户ID' })
  appUserId: number;

  @Index({ unique: true })
  @Column({ comment: '后台用户ID(base_sys_user.id)' })
  adminUserId: number;

  @Column({ comment: '备注', nullable: true })
  remark: string;
}
