import { CoolController, BaseController } from '@cool-midway/core';
import { CustomerEntity } from '../../entity/customer';

/**
 * 客户管理
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: CustomerEntity,
  pageQueryOp: {
    keyWordLikeFields: ['name', 'phone'],
  },
})
export class AdminCustomerController extends BaseController {}
