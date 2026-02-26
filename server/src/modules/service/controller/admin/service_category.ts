import { CoolController, BaseController } from '@cool-midway/core';
import { ServiceCategoryEntity } from '../../entity/service_category';

/**
 * 服务分类（后台可配置：全车贴膜、局部贴膜、隐形车衣、改色膜、窗膜等）
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: ServiceCategoryEntity,
  listQueryOp: {
    keyWordLikeFields: ['name'],
  },
})
export class AdminServiceCategoryController extends BaseController {}
