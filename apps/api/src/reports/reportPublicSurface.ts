export type {
  DailyReport,
  DailyReportContent,
  ListReportsCriteria,
  PostReportCommentInput,
  PutDailyReportInput,
  PutReportInput,
  PutWeeklyReportInput,
  Report,
  ReportComment,
  ReportStatus,
  ReportType,
  WeeklyReport,
  WeeklyReportContent,
} from './reportTypes.js';

export {
  DAILY_REPORT_CONTENT_FIELDS,
  REPORT_CONTENT_FIELD_MAX_LENGTH,
  REPORT_STATUS_DRAFT,
  REPORT_STATUS_SUBMITTED,
  REPORT_TYPE_DAILY,
  REPORT_TYPE_WEEKLY,
} from './reportConstants.js';

export {
  addReportComment,
  getDailyReport,
  getReportById,
  getWeeklyReport,
  listOwnReports,
  listReports,
  putDailyReport,
  putWeeklyReport,
  updateReportComment,
} from './reportFacade.js';
