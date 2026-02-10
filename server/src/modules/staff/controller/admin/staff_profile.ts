import { CoolController, BaseController } from '@cool-midway/core';
import { StaffProfileEntity } from '../../entity/staff_profile';

/**
 * 员工档案管理
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: StaffProfileEntity,
  pageQueryOp: {
    fieldEq: ['userId'],
  },
})
export class AdminStaffProfileController extends BaseController {}
