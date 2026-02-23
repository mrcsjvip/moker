import { Provide } from '@midwayjs/core';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { BaseSysConfEntity } from '../../entity/sys/conf';

/** 业务配置键（app 端可获取，按租户隔离） */
export const BUSINESS_CONF_KEYS = ['service_phone'] as const;

/**
 * 系统配置（按租户隔离：先取当前租户配置，无则取全局 tenantId=null）
 */
@Provide()
export class BaseSysConfService extends BaseService {
  @InjectEntityModel(BaseSysConfEntity)
  baseSysConfEntity: Repository<BaseSysConfEntity>;

  /**
   * 获得配置参数值（兼容旧用法：不传 tenantId 时仅查全局）
   * @param key 配置键
   * @param tenantId 租户ID，传则先查该租户再回退全局
   */
  async getValue(key: string, tenantId?: number | null): Promise<string | undefined> {
    if (tenantId != null && !Number.isNaN(Number(tenantId))) {
      const tenantRow = await this.baseSysConfEntity.findOne({
        where: { cKey: key, tenantId },
      });
      if (tenantRow) return tenantRow.cValue;
    }
    const globalRow = await this.baseSysConfEntity.findOne({
      where: { cKey: key, tenantId: IsNull() },
    });
    return globalRow?.cValue;
  }

  /**
   * 批量获取配置（按租户：先租户后全局）
   */
  async getValues(keys: string[], tenantId?: number | null): Promise<Record<string, string>> {
    const out: Record<string, string> = {};
    for (const key of keys) {
      const v = await this.getValue(key, tenantId);
      if (v != null) out[key] = v;
    }
    return out;
  }

  /**
   * 更新配置参数（兼容旧用法：不传 tenantId 时更新全局）
   */
  async updateVaule(cKey: string, cValue: string, tenantId?: number | null): Promise<void> {
    const qb = this.baseSysConfEntity.createQueryBuilder().update().set({ cValue });
    if (tenantId != null && !Number.isNaN(Number(tenantId))) {
      qb.where('cKey = :cKey AND tenantId = :tenantId', { cKey, tenantId });
    } else {
      qb.where('cKey = :cKey AND tenantId IS NULL', { cKey });
    }
    await qb.execute();
  }

  /**
   * 设置配置（存在则更新，不存在则新增；按租户）
   */
  async setValue(cKey: string, cValue: string, tenantId?: number | null): Promise<void> {
    const tid = tenantId != null && !Number.isNaN(Number(tenantId)) ? tenantId : null;
    const where = tid === null ? { cKey, tenantId: null } : { cKey, tenantId: tid };
    const existing = await this.baseSysConfEntity.findOne({ where });
    if (existing) {
      existing.cValue = cValue;
      await this.baseSysConfEntity.save(existing);
    } else {
      await this.baseSysConfEntity.save(
        this.baseSysConfEntity.create({ cKey, cValue, tenantId: tid } as any)
      );
    }
  }
}
