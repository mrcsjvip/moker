import { Provide } from '@midwayjs/core';
import { CoolController, BaseController } from '@cool-midway/core';
import { BaseSysChainHeadquartersEntity } from '../../../entity/sys/chain_headquarters';
import { BaseSysChainHeadquartersService } from '../../../service/sys/chain_headquarters';

/**
 * 连锁总部
 */
@Provide()
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: BaseSysChainHeadquartersEntity,
  service: BaseSysChainHeadquartersService,
  pageQueryOp: {
    keyWordLikeFields: ['name', 'remark'],
  },
})
export class BaseSysChainHeadquartersController extends BaseController {}
