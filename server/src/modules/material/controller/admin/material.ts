import { CoolController, BaseController } from '@cool-midway/core';
import { MaterialEntity } from '../../entity/material';

/**
 * 物料管理
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: MaterialEntity,
  pageQueryOp: {
    keyWordLikeFields: ['name', 'sku'],
  },
})
export class AdminMaterialController extends BaseController {}
