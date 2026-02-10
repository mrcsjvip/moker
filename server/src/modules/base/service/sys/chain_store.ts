import { Inject, Init, Provide } from '@midwayjs/core';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { BaseSysChainStoreEntity } from '../../entity/sys/chain_store';
import * as _ from 'lodash';

/**
 * 门店
 */
@Provide()
export class BaseSysChainStoreService extends BaseService {
  @InjectEntityModel(BaseSysChainStoreEntity)
  baseSysChainStoreEntity: Repository<BaseSysChainStoreEntity>;

  @Inject()
  ctx: any;

  @Init()
  async init() {
    await super.init();
    this.setEntity(this.baseSysChainStoreEntity);
  }

  /**
   * 分页查询（关联总部名称）；租户管理员仅看本租户门店，超管不看租户条件
   */
  async page(query: any) {
    const { keyWord, headquartersId } = query;
    const tenantId = this.ctx?.admin?.tenantId ?? null;
    const sql = `
      SELECT a.id, a.headquartersId, a.name, a.address, a.contact, a.remark, a.createTime, a.updateTime, a.tenantId,
        b.name AS headquartersName
      FROM base_sys_chain_store a
      LEFT JOIN base_sys_chain_headquarters b ON a.headquartersId = b.id
      WHERE 1 = 1
      ${tenantId != null ? 'AND a.tenantId = ?' : ''}
      ${this.setSql(headquartersId, 'AND a.headquartersId = ?', [headquartersId])}
      ${this.setSql(keyWord, 'AND (a.name LIKE ? OR a.address LIKE ? OR a.contact LIKE ?)', [
        `%${keyWord}%`,
        `%${keyWord}%`,
        `%${keyWord}%`,
      ])}
    `;
    // 租户条件下需把 tenantId 插入参数首位，与上面 WHERE 中 a.tenantId = ? 对应
    if (tenantId != null) {
      this.service.sqlParams = [tenantId, ...(this.service.sqlParams || [])];
    }
    return this.sqlRenderPage(sql, query);
  }
}
