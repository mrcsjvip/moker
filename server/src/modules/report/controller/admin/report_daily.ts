import { CoolController, BaseController } from '@cool-midway/core';
import { ReportDailyEntity } from '../../entity/report_daily';

/**
 * 日报表
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: ReportDailyEntity,
  pageQueryOp: {
    fieldEq: ['storeId', 'reportDate'],
  },
})
export class AdminReportDailyController extends BaseController {}
