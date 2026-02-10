import { CoolController, BaseController } from '@cool-midway/core';
import { AuditLogEntity } from '../../entity/audit_log';

/**
 * 审计日志
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: AuditLogEntity,
  pageQueryOp: {
    fieldEq: ['module', 'operatorId'],
  },
})
export class AdminAuditLogController extends BaseController {}
