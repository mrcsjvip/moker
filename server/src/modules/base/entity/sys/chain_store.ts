import { BaseEntity } from '../base';
import { Column, Entity, Index } from 'typeorm';

/**
 * 门店
 */
@Entity('base_sys_chain_store')
export class BaseSysChainStoreEntity extends BaseEntity {
  @Index()
  @Column({ comment: '所属总部ID' })
  headquartersId: number;

  @Column({ comment: '门店名称', length: 100 })
  name: string;

  @Column({ comment: '地址', nullable: true })
  address: string;

  @Column({ comment: '联系电话', length: 20, nullable: true })
  contact: string;

  @Column({ comment: '备注', nullable: true })
  remark: string;
}
