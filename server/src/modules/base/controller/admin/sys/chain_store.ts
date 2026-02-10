import { Provide } from '@midwayjs/core';
import { CoolController, BaseController } from '@cool-midway/core';
import { BaseSysChainStoreEntity } from '../../../entity/sys/chain_store';
import { BaseSysChainStoreService } from '../../../service/sys/chain_store';

/**
 * 门店
 */
@Provide()
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: BaseSysChainStoreEntity,
  service: BaseSysChainStoreService,
  pageQueryOp: {
    keyWordLikeFields: ['name', 'address', 'contact'],
    fieldEq: [{ column: 'a.headquartersId', requestParam: 'headquartersId' }],
  },
})
export class BaseSysChainStoreController extends BaseController {}
