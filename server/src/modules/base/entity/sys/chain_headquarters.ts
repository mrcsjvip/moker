import { BaseEntity } from '../base';
import { Column, Entity } from 'typeorm';

/**
 * 连锁总部
 */
@Entity('base_sys_chain_headquarters')
export class BaseSysChainHeadquartersEntity extends BaseEntity {
  @Column({ comment: '总部名称', length: 100 })
  name: string;

  @Column({ comment: '备注', nullable: true })
  remark: string;
}
