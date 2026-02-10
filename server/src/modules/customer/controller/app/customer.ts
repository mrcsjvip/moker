import { CoolController, BaseController } from '@cool-midway/core';
import { CustomerEntity } from '../../entity/customer';

/**
 * 客户信息（C端）
 */
@CoolController({
  api: ['info', 'update'],
  entity: CustomerEntity,
})
export class AppCustomerController extends BaseController {}
