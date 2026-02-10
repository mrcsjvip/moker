import { Init, Provide } from '@midwayjs/core';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { BaseSysChainHeadquartersEntity } from '../../entity/sys/chain_headquarters';

/**
 * 连锁总部
 */
@Provide()
export class BaseSysChainHeadquartersService extends BaseService {
  @InjectEntityModel(BaseSysChainHeadquartersEntity)
  baseSysChainHeadquartersEntity: Repository<BaseSysChainHeadquartersEntity>;

  @Init()
  async init() {
    await super.init();
    this.setEntity(this.baseSysChainHeadquartersEntity);
  }
}
