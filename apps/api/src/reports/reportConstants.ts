export const REPORT_TYPE = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
} as const;

export const REPORT_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
} as const;

export const REPORT_TYPE_DAILY = REPORT_TYPE.DAILY;
export const REPORT_TYPE_WEEKLY = REPORT_TYPE.WEEKLY;

export const REPORT_STATUS_DRAFT = REPORT_STATUS.DRAFT;
export const REPORT_STATUS_SUBMITTED = REPORT_STATUS.SUBMITTED;

export type ReportType = (typeof REPORT_TYPE)[keyof typeof REPORT_TYPE];
export type ReportStatus = (typeof REPORT_STATUS)[keyof typeof REPORT_STATUS];

export const REPORT_STATUSES = Object.values(REPORT_STATUS) as ReportStatus[];

export const REPORT_TYPES = Object.values(REPORT_TYPE) as ReportType[];

export const REPORT_CONTENT_FIELD_MAX_LENGTH = 2000;

export const DAILY_REPORT_CONTENT_FIELDS = [
  'doneToday',
  'learnedToday',
  'blockers',
  'planTomorrow',
] as const;

export type DailyReportContentField =
  (typeof DAILY_REPORT_CONTENT_FIELDS)[number];

export const WEEKLY_REPORT_CONTENT_FIELDS = [
  'achievements',
  'nextWeekGoals',
  'reflection',
  'questionsForTrainer',
] as const;

export type WeeklyReportContentField =
  (typeof WEEKLY_REPORT_CONTENT_FIELDS)[number];

export const REPORT_CONTENT_FIELDS_BY_TYPE = {
  [REPORT_TYPE.DAILY]: DAILY_REPORT_CONTENT_FIELDS,
  [REPORT_TYPE.WEEKLY]: WEEKLY_REPORT_CONTENT_FIELDS,
} as const satisfies Record<ReportType, readonly string[]>;
