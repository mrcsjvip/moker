import { CoolController, BaseController } from '@cool-midway/core';
import { ServiceCategoryEntity } from '../../entity/service_category';

/**
 * 服务分类列表（C端预约贴膜时展示）
 * 路由: GET /app/service/category/list
 */
@CoolController('/app/service/category', {
  api: ['list'],
  entity: ServiceCategoryEntity,
})
export class AppServiceCategoryController extends BaseController {}
