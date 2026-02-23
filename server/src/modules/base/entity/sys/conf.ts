import { Column, Index, Entity } from 'typeorm';
import { BaseEntity } from '../base';

/**
 * 系统配置（按租户隔离：同一 cKey 可配置全局 tenantId=null 或按租户覆盖）
 */
@Entity('base_sys_conf')
@Index('idx_conf_tenant_key', ['tenantId', 'cKey'], { unique: true })
export class BaseSysConfEntity extends BaseEntity {
  @Column({ comment: '配置键' })
  cKey: string;

  @Column({ comment: '配置值' })
  cValue: string;
}
