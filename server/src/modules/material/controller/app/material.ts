import { CoolController, BaseController } from '@cool-midway/core';
import { MaterialEntity } from '../../entity/material';

/**
 * 物料（员工端）
 */
@CoolController({
  api: ['list', 'page', 'info'],
  entity: MaterialEntity,
})
export class AppMaterialController extends BaseController {}
