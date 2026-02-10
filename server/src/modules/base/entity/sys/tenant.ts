import { BaseEntity } from '../base';
import { Column, Entity } from 'typeorm';

/**
 * 租户
 */
@Entity('base_sys_tenant')
export class BaseSysTenantEntity extends BaseEntity {
  @Column({ comment: '租户名称', length: 100 })
  name: string;

  /** 到期日，为空表示永不过期；仅未过期的租户可登录 */
  @Column({ comment: '到期日', type: 'date', nullable: true })
  expireDate: string;

  @Column({ comment: '备注', nullable: true })
  remark: string;
}
