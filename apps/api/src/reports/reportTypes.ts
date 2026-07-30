import type {
  DailyReportContentField,
  ReportStatus,
  ReportType,
  WeeklyReportContentField,
} from './reportConstants.js';
import { REPORT_TYPE_DAILY, REPORT_TYPE_WEEKLY } from './reportConstants.js';

export type { ReportStatus, ReportType } from './reportConstants.js';

export type DailyReportContent = Record<DailyReportContentField, string>;

export type WeeklyReportContent = Record<WeeklyReportContentField, string>;

export type ReportContentByType = {
  [REPORT_TYPE_DAILY]: DailyReportContent;
  [REPORT_TYPE_WEEKLY]: WeeklyReportContent;
};

/** トレーナーコメント（UC-R05 / P-R01） */
export interface ReportComment {
  id: string;
  authorId: string;
  content: string;
  createdAt: string;
}

export interface PostReportCommentInput {
  content: string;
}

/** PUT コメント更新の入力（POST と同じ形） */
export type PutReportCommentInput = PostReportCommentInput;

export interface Report {
  id: string;
  traineeId: string;
  type: ReportType;
  periodKey: string;
  content: ReportContentByType[ReportType];
  status: ReportStatus;
  comments: ReportComment[];
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type DailyReport = Report & {
  type: typeof REPORT_TYPE_DAILY;
  content: ReportContentByType[typeof REPORT_TYPE_DAILY];
};

export type WeeklyReport = Report & {
  type: typeof REPORT_TYPE_WEEKLY;
  content: ReportContentByType[typeof REPORT_TYPE_WEEKLY];
};

export interface PutReportInput<TContent extends Record<string, string>> {
  status: ReportStatus;
  content: TContent;
}

export type PutReportInputByType = {
  [TType in ReportType]: PutReportInput<ReportContentByType[TType]>;
};

export type PutDailyReportInput =
  PutReportInputByType[typeof REPORT_TYPE_DAILY];

export type PutWeeklyReportInput =
  PutReportInputByType[typeof REPORT_TYPE_WEEKLY];

export type OwnedReportByType = {
  [REPORT_TYPE_DAILY]: DailyReport;
  [REPORT_TYPE_WEEKLY]: WeeklyReport;
};

/** トレーナー向け報告一覧の検索条件 */
export interface ListReportsCriteria {
  traineeId: string;
  type?: ReportType;
}
