export const REPORT_TYPE_DAILY = 'daily' as const;
export const REPORT_TYPE_WEEKLY = 'weekly' as const;

export type ReportFormType =
  typeof REPORT_TYPE_DAILY | typeof REPORT_TYPE_WEEKLY;

export const REPORT_PAGE_PATH = '/reports';
export const DAILY_REPORT_LIST_PATH = '/reports/daily/list';
export const WEEKLY_REPORT_LIST_PATH = '/reports/weekly/list';
/** 廃止ルート（直接アクセス時は `/reports` へリダイレクト） */
export const DAILY_REPORT_PATH = '/reports/daily';
export const WEEKLY_REPORT_PATH = '/reports/weekly';
export const REPORT_LIST_PATH = REPORT_PAGE_PATH;
/** react-router の詳細ルート定義（`:reportId` パラメータ） */
export const REPORT_DETAIL_ROUTE_PATH = `${REPORT_LIST_PATH}/:reportId`;

export function buildReportDetailPath(reportId: string): string {
  return `${REPORT_LIST_PATH}/${reportId}`;
}

export const DAILY_REPORT_PAGE_TITLE = '日次報告';
export const WEEKLY_REPORT_PAGE_TITLE = '週次報告';
export const REPORT_LIST_PAGE_TITLE = '報告書一覧';
export const REPORT_DETAIL_PAGE_TITLE = '報告詳細';

/** 新卒 `/reports` の日次／週次切替（BR-R07 / BR-R09） */
export const REPORT_TYPE_TOGGLE_ARIA_LABEL = '報告種別';
export const REPORT_TYPE_TOGGLE_DAILY_LABEL = DAILY_REPORT_PAGE_TITLE;
export const REPORT_TYPE_TOGGLE_WEEKLY_LABEL = WEEKLY_REPORT_PAGE_TITLE;
export const REPORT_SPLIT_VIEW_ARIA_LABEL = '報告書の入力と一覧';

export const DAILY_REPORT_HEADING_ID = 'daily-report-heading';
export const WEEKLY_REPORT_HEADING_ID = 'weekly-report-heading';
export const REPORT_LIST_HEADING_ID = 'report-list-heading';
export const REPORT_DETAIL_HEADING_ID = 'report-detail-heading';

/** トレーナーコメント（UC-R05 / P-R01 / P-R02） */
export const REPORT_COMMENT_FIELD_LABEL = 'コメント';
export const REPORT_COMMENT_FIELD_ID = 'report-comment';
export const REPORT_COMMENT_SUBMIT_BUTTON_LABEL = 'コメントを送信';
export const REPORT_COMMENT_SECTION_LABEL = 'トレーナーコメント';
export const REPORT_COMMENTS_HEADING_ID = 'report-comments-heading';
export const REPORT_COMMENT_EDIT_BUTTON_LABEL = 'コメントを編集';
export const REPORT_COMMENT_EDIT_FIELD_LABEL = '編集中のコメント';
export const REPORT_COMMENT_EDIT_FIELD_ID = 'report-comment-edit';
export const REPORT_COMMENT_UPDATE_BUTTON_LABEL = 'コメントを更新';

export const REPORT_NAV_ARIA_LABEL = '報告書';
/** ヘッダーナビの報告書リンク文言（新卒・トレーナー共通） */
export const REPORT_HEADER_NAV_LABEL = REPORT_NAV_ARIA_LABEL;

export const DAILY_REPORT_LIST_LINK_LABEL = '日次報告書一覧';
export const WEEKLY_REPORT_LIST_LINK_LABEL = '週次報告書一覧';
export const DAILY_REPORT_LIST_PAGE_TITLE = '日次報告書一覧';
export const WEEKLY_REPORT_LIST_PAGE_TITLE = '週次報告書一覧';
export const DAILY_REPORT_LIST_HEADING_ID = 'daily-report-list-heading';
export const WEEKLY_REPORT_LIST_HEADING_ID = 'weekly-report-list-heading';

/** BR-R15: 期間条件の同時指定エラー（API 400 / U-R49） */
export const REPORT_PERIOD_FILTER_CONFLICT_MESSAGE =
  '期間の範囲指定と特定日は同時に使えません。どちらか一方だけを指定してください。' as const;

export const REPORT_LIST_SEARCH_FIELD_ID = 'report-list-search';
export const REPORT_LIST_FROM_FIELD_ID = 'report-list-from';
export const REPORT_LIST_TO_FIELD_ID = 'report-list-to';
export const REPORT_LIST_DATE_FIELD_ID = 'report-list-date';
export const REPORT_LIST_FILTER_BUTTON_LABEL = '絞り込み';

export interface OwnReportListQuery {
  readonly q?: string;
  readonly from?: string;
  readonly to?: string;
  readonly date?: string;
}

/** `from`/`to` と `date` が同時指定されているか（BR-R13 / BR-R15） */
export function hasReportPeriodFilterConflict(
  query: OwnReportListQuery,
): boolean {
  const hasRange = query.from !== undefined || query.to !== undefined;
  const hasDate = query.date !== undefined;
  return hasRange && hasDate;
}

/** トレーナー報告一覧の種別フィルタ（E-R10 / §8.6.2） */
export const REPORT_TYPE_FILTER_LABEL = '報告種別';
export const REPORT_TYPE_FILTER_FIELD_ID = 'report-type-filter';
export const REPORT_TYPE_FILTER_ALL_VALUE = '' as const;
export const REPORT_TYPE_FILTER_ALL_LABEL = 'すべて';

export const REPORT_TYPE_FILTER_OPTIONS = [
  {
    value: REPORT_TYPE_FILTER_ALL_VALUE,
    label: REPORT_TYPE_FILTER_ALL_LABEL,
  },
  { value: REPORT_TYPE_DAILY, label: DAILY_REPORT_PAGE_TITLE },
  { value: REPORT_TYPE_WEEKLY, label: WEEKLY_REPORT_PAGE_TITLE },
] as const;

export type ReportTypeFilterValue =
  (typeof REPORT_TYPE_FILTER_OPTIONS)[number]['value'];

/** select の文字列値をフィルタ値へ変換する（不正値は null） */
export function parseReportTypeFilterValue(
  value: string,
): ReportTypeFilterValue | null {
  const matched = REPORT_TYPE_FILTER_OPTIONS.find(
    (option) => option.value === value,
  );
  return matched?.value ?? null;
}

/** UI フィルタを一覧 API の `type` クエリへ変換する（「すべて」は未指定） */
export function toReportsListTypeQuery(
  filter: ReportTypeFilterValue,
): ReportFormType | undefined {
  return filter === REPORT_TYPE_FILTER_ALL_VALUE ? undefined : filter;
}

export interface ReportNavLinkItem {
  readonly to: string;
  readonly label: string;
}

/** @deprecated ホーム内導線は廃止（ヘッダー「報告書」のみ） */
export const TRAINEE_REPORT_NAV_LINKS: readonly ReportNavLinkItem[] = [];

/** @deprecated ダッシュボード内導線は廃止（ヘッダー「報告書」のみ） */
export const TRAINER_REPORT_NAV_LINKS: readonly ReportNavLinkItem[] = [];

export const REPORT_STATUS_DRAFT = 'draft' as const;
export const REPORT_STATUS_SUBMITTED = 'submitted' as const;

export type ReportFormStatus =
  typeof REPORT_STATUS_DRAFT | typeof REPORT_STATUS_SUBMITTED;

export const DAILY_REPORT_DRAFT_SAVE_BUTTON_LABEL = '下書き保存';
export const DAILY_REPORT_DRAFT_SAVE_SUCCESS_MESSAGE = '下書きを保存しました';

export const REPORT_SUBMIT_BUTTON_LABEL = '提出';
export const REPORT_SUBMIT_SUCCESS_MESSAGE = '提出しました';

/** 日次提出時に doneToday が空のときのバリデーションメッセージ（E-R09 / U-R09） */
export const DAILY_REPORT_DONE_TODAY_REQUIRED_MESSAGE =
  '本日やったことを入力してください';

export const REPORT_PERSIST_FAILED_MESSAGE = '保存に失敗しました';

export const PAST_DAILY_REPORTS_SECTION_LABEL = '過去の日次報告';
export const PAST_WEEKLY_REPORTS_SECTION_LABEL = '過去の週次報告';

export type ReportPersistFeedback =
  | { readonly type: 'success'; readonly message: string }
  | { readonly type: 'error'; readonly message: string }
  | null;

export function getDailyReportPersistSuccessMessage(
  status: ReportFormStatus,
): string {
  return status === REPORT_STATUS_DRAFT
    ? DAILY_REPORT_DRAFT_SAVE_SUCCESS_MESSAGE
    : REPORT_SUBMIT_SUCCESS_MESSAGE;
}

export function getWeeklyReportPersistSuccessMessage(
  _status: ReportFormStatus,
): string {
  return REPORT_SUBMIT_SUCCESS_MESSAGE;
}

export const DAILY_REPORT_FORM_FIELDS = [
  { key: 'doneToday', label: '本日やったこと' },
  { key: 'learnedToday', label: '学んだこと' },
  { key: 'blockers', label: '困っていること' },
  { key: 'planTomorrow', label: '明日やること' },
] as const;

export const WEEKLY_REPORT_FORM_FIELDS = [
  { key: 'achievements', label: '今週の成果' },
  { key: 'nextWeekGoals', label: '来週の目標' },
  { key: 'reflection', label: '所感' },
  { key: 'questionsForTrainer', label: 'トレーナーへの相談' },
] as const;

export type DailyReportFormFieldKey =
  (typeof DAILY_REPORT_FORM_FIELDS)[number]['key'];

export type WeeklyReportFormFieldKey =
  (typeof WEEKLY_REPORT_FORM_FIELDS)[number]['key'];

const DAILY_REPORT_DONE_TODAY_FIELD_KEY =
  'doneToday' satisfies DailyReportFormFieldKey;

function isBlankDailyDoneToday(content: Record<string, string>): boolean {
  const doneToday = content[DAILY_REPORT_DONE_TODAY_FIELD_KEY];
  return typeof doneToday === 'string' && doneToday.trim().length === 0;
}

/** PUT 失敗時に画面表示するエラーメッセージを解決する */
export function getOwnedReportPersistErrorMessage(
  status: ReportFormStatus,
  content: Record<string, string>,
): string {
  if (status === REPORT_STATUS_SUBMITTED && isBlankDailyDoneToday(content)) {
    return DAILY_REPORT_DONE_TODAY_REQUIRED_MESSAGE;
  }

  return REPORT_PERSIST_FAILED_MESSAGE;
}

export type DailyReportFormValues = Record<DailyReportFormFieldKey, string>;
export type WeeklyReportFormValues = Record<WeeklyReportFormFieldKey, string>;

export type ReportFormFieldDefinition<TKey extends string = string> = {
  readonly key: TKey;
  readonly label: string;
};

export function createEmptyReportFormValues<TKey extends string>(
  fields: readonly ReportFormFieldDefinition<TKey>[],
): Record<TKey, string> {
  const values = {} as Record<TKey, string>;
  for (const field of fields) {
    values[field.key] = '';
  }
  return values;
}

export function createEmptyDailyReportFormValues(): DailyReportFormValues {
  return createEmptyReportFormValues(DAILY_REPORT_FORM_FIELDS);
}

export function createEmptyWeeklyReportFormValues(): WeeklyReportFormValues {
  return createEmptyReportFormValues(WEEKLY_REPORT_FORM_FIELDS);
}

export function buildReportFieldId(
  reportType: ReportFormType,
  key: string,
): string {
  return `${reportType}-report-${key}`;
}

export function getReportFormFieldLabels<TKey extends string>(
  fields: readonly ReportFormFieldDefinition<TKey>[],
): readonly string[] {
  return fields.map((field) => field.label);
}

/** 日次報告の periodKey（YYYY-MM-DD）をローカル日付から生成する */
export function formatDailyReportPeriodKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** 週次報告の periodKey（YYYY-Www / ISO 週）をローカル日付から生成する */
export function formatWeeklyReportPeriodKey(date: Date): string {
  const utcDate = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  const dayOfWeek = utcDate.getUTCDay() || 7;
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - dayOfWeek);
  const isoYear = utcDate.getUTCFullYear();
  const yearStart = new Date(Date.UTC(isoYear, 0, 1));
  const week = Math.ceil(
    ((utcDate.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7,
  );
  return `${isoYear}-W${String(week).padStart(2, '0')}`;
}

export interface PutReportFormInput<TContent extends Record<string, string>> {
  status: ReportFormStatus;
  content: TContent;
}

export type PutDailyReportInput = PutReportFormInput<DailyReportFormValues>;
export type PutWeeklyReportInput = PutReportFormInput<WeeklyReportFormValues>;

export interface ReportCommentResponse {
  id: string;
  authorId: string;
  content: string;
  createdAt: string;
}

export interface PostReportCommentInput {
  content: string;
}

interface ReportResponseBase {
  id: string;
  traineeId: string;
  periodKey: string;
  status: ReportFormStatus;
  comments?: readonly ReportCommentResponse[];
  submittedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DailyReportResponse extends ReportResponseBase {
  type: typeof REPORT_TYPE_DAILY;
  content: DailyReportFormValues;
}

export interface WeeklyReportResponse extends ReportResponseBase {
  type: typeof REPORT_TYPE_WEEKLY;
  content: WeeklyReportFormValues;
}

export type ReportResponse = DailyReportResponse | WeeklyReportResponse;
