import { CoolController, BaseController } from '@cool-midway/core';
import { StaffProfileEntity } from '../../entity/staff_profile';

/**
 * 员工档案（员工端）
 */
@CoolController({
  api: ['info', 'update'],
  entity: StaffProfileEntity,
})
export class AppStaffProfileController extends BaseController {}
