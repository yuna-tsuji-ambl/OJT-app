import {
  expect,
  type APIRequestContext,
  type Locator,
  type Page,
  type Response,
} from '@playwright/test';

export const TRAINEE_HOME_PATH = '/home';
export const TRAINEE_HOME_PAGE_TITLE = 'ホーム';
export const TRAINEE_HOME_NAV_LINK_NAME = TRAINEE_HOME_PAGE_TITLE;
export const TRAINER_DASHBOARD_PATH = '/dashboard';
export const TRAINER_DASHBOARD_PAGE_TITLE = 'ダッシュボード';
export const REPORT_PAGE_PATH = '/reports';
/** 廃止ルート（E-R12: 直接アクセス時は `/reports` へリダイレクト） */
export const DAILY_REPORT_LEGACY_PATH = '/reports/daily';
export const WEEKLY_REPORT_LEGACY_PATH = '/reports/weekly';
export const DAILY_REPORT_LIST_PATH = '/reports/daily/list';
export const WEEKLY_REPORT_LIST_PATH = '/reports/weekly/list';
export const REPORT_LIST_PATH = REPORT_PAGE_PATH;
export const TRAINEE_REPORT_PAGE_TITLE = '報告書';
export const DAILY_REPORT_PAGE_TITLE = '日次報告';
export const WEEKLY_REPORT_PAGE_TITLE = '週次報告';
export const REPORT_LIST_PAGE_TITLE = '報告書一覧';
export const MAIN_NAV_ARIA_LABEL = 'メインナビゲーション';
export const REPORT_HEADER_NAV_LABEL = '報告書';
export const DAILY_REPORT_LIST_LINK_LABEL = '日次報告書一覧';
export const WEEKLY_REPORT_LIST_LINK_LABEL = '週次報告書一覧';
export const DAILY_REPORT_LIST_PAGE_TITLE = '日次報告書一覧';
export const WEEKLY_REPORT_LIST_PAGE_TITLE = '週次報告書一覧';
export const REPORT_LIST_FILTER_FORM_ARIA_LABEL = '報告書一覧の絞り込み';
export const REPORT_LIST_SEARCH_LABEL = '本文検索';
export const REPORT_LIST_FROM_LABEL = '開始';
export const REPORT_LIST_TO_LABEL = '終了';
export const REPORT_LIST_DATE_LABEL = '特定日';
export const REPORT_LIST_WEEKLY_DATE_LABEL = '特定日または週キー';
export const REPORT_LIST_FILTER_BUTTON_LABEL = '絞り込み';
export const REPORT_PERIOD_FILTER_CONFLICT_MESSAGE =
  '期間の範囲指定と特定日は同時に使えません。どちらか一方だけを指定してください。';
export const PAST_DAILY_REPORTS_SECTION_LABEL = '過去の日次報告';
export const PAST_WEEKLY_REPORTS_SECTION_LABEL = '過去の週次報告';
export const DAILY_REPORT_DRAFT_SAVE_BUTTON_LABEL = '下書き保存';
export const DAILY_REPORT_DRAFT_SAVE_SUCCESS_MESSAGE = '下書きを保存しました';
export const REPORT_SUBMIT_BUTTON_LABEL = '提出';
export const REPORT_SUBMIT_SUCCESS_MESSAGE = '提出しました';
/** 日次提出時に「本日やったこと」が空のときのバリデーションメッセージ（E-R09） */
export const DAILY_REPORT_DONE_TODAY_REQUIRED_MESSAGE =
  '本日やったことを入力してください';

/** トレーナー報告一覧の種別フィルタ（E-R10） */
export const REPORT_TYPE_FILTER_LABEL = '報告種別';
export const REPORT_TYPE_FILTER_VALUE_DAILY = 'daily';
export const REPORT_TYPE_FILTER_VALUE_WEEKLY = 'weekly';

/** 報告詳細・トレーナーコメント（P-R01 / P-R02 / UC-R05） */
export const REPORT_DETAIL_PAGE_TITLE = '報告詳細';
export const REPORT_COMMENT_FIELD_LABEL = 'コメント';
export const REPORT_COMMENT_SUBMIT_BUTTON_LABEL = 'コメントを送信';
export const REPORT_COMMENT_SECTION_LABEL = 'トレーナーコメント';
export const REPORT_COMMENT_EDIT_BUTTON_LABEL = 'コメントを編集';
export const REPORT_COMMENT_EDIT_FIELD_LABEL = '編集中のコメント';
export const REPORT_COMMENT_UPDATE_BUTTON_LABEL = 'コメントを更新';

const TRAINEE_API_HEADERS = {
  'Content-Type': 'application/json',
  'X-User-Id': 'trainee-1',
  'X-User-Role': 'trainee',
} as const;

export const DAILY_REPORT_FIELD_LABELS = {
  doneToday: '本日やったこと',
  learnedToday: '学んだこと',
  blockers: '困っていること',
  planTomorrow: '明日やること',
} as const;

export const WEEKLY_REPORT_FIELD_LABELS = {
  achievements: '今週の成果',
  nextWeekGoals: '来週の目標',
  reflection: '所感',
  questionsForTrainer: 'トレーナーへの相談',
} as const;

interface ReportFormPageDescriptor {
  readonly path: string;
  readonly title: string;
  readonly firstFieldLabel: string;
}

const DAILY_REPORT_FORM_PAGE = {
  path: REPORT_PAGE_PATH,
  title: DAILY_REPORT_PAGE_TITLE,
  firstFieldLabel: DAILY_REPORT_FIELD_LABELS.doneToday,
} as const satisfies ReportFormPageDescriptor;

const WEEKLY_REPORT_FORM_PAGE = {
  path: REPORT_PAGE_PATH,
  title: WEEKLY_REPORT_PAGE_TITLE,
  firstFieldLabel: WEEKLY_REPORT_FIELD_LABELS.achievements,
} as const satisfies ReportFormPageDescriptor;

export type DailyReportFieldKey = keyof typeof DAILY_REPORT_FIELD_LABELS;
export type DailyReportFieldValues = Record<DailyReportFieldKey, string>;
export type PartialDailyReportFieldValues = Partial<DailyReportFieldValues>;

export type WeeklyReportFieldKey = keyof typeof WEEKLY_REPORT_FIELD_LABELS;
export type WeeklyReportFieldValues = Record<WeeklyReportFieldKey, string>;
export type PartialWeeklyReportFieldValues = Partial<WeeklyReportFieldValues>;

export type ReportApiStatus = 'draft' | 'submitted';

interface ReportStatusResponseBody {
  status?: string;
}

const DAILY_REPORT_PUT_PATH_PATTERN =
  /\/api\/reports\/daily\/\d{4}-\d{2}-\d{2}$/;
const WEEKLY_REPORT_PUT_PATH_PATTERN = /\/api\/reports\/weekly\/\d{4}-W\d{2}$/;

/** 日次報告の periodKey（YYYY-MM-DD）。Web の formatDailyReportPeriodKey と同一 */
export function formatDailyReportPeriodKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** 基準日から daysAgo 日前の日次 periodKey を返す（E-R08） */
export function formatDailyReportPeriodKeyDaysAgo(
  daysAgo: number,
  baseDate: Date = new Date(),
): string {
  const date = new Date(
    baseDate.getFullYear(),
    baseDate.getMonth(),
    baseDate.getDate() - daysAgo,
  );
  return formatDailyReportPeriodKey(date);
}

/** 週次報告の periodKey（YYYY-Www / ISO 週） */
export function formatWeeklyReportPeriodKey(date: Date = new Date()): string {
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

/** 基準日から weeksAgo 週前の週次 periodKey を返す（E-R10） */
export function formatWeeklyReportPeriodKeyWeeksAgo(
  weeksAgo: number,
  baseDate: Date = new Date(),
): string {
  const date = new Date(
    baseDate.getFullYear(),
    baseDate.getMonth(),
    baseDate.getDate() - weeksAgo * 7,
  );
  return formatWeeklyReportPeriodKey(date);
}

async function forEachProvidedField<TKey extends string>(
  values: Partial<Record<TKey, string>>,
  action: (key: TKey, value: string) => Promise<void>,
): Promise<void> {
  for (const key of Object.keys(values) as TKey[]) {
    const value = values[key];
    if (value === undefined) {
      continue;
    }
    await action(key, value);
  }
}

async function expectHeadingVisible(page: Page, title: string): Promise<void> {
  await expect(page.getByRole('heading', { name: title })).toBeVisible();
}

async function openPageWithHeading(
  page: Page,
  path: string,
  title: string,
): Promise<void> {
  await page.goto(path);
  await expectHeadingVisible(page, title);
}

function mainNavigation(page: Page): Locator {
  return page.getByRole('navigation', { name: MAIN_NAV_ARIA_LABEL });
}

async function clickMainNavLink(page: Page, linkName: string): Promise<void> {
  await mainNavigation(page).getByRole('link', { name: linkName }).click();
}

export function dailyReportForm(page: Page): Locator {
  return page.getByRole('form', { name: DAILY_REPORT_PAGE_TITLE });
}

export function weeklyReportForm(page: Page): Locator {
  return page.getByRole('form', { name: WEEKLY_REPORT_PAGE_TITLE });
}

/** フォーム直近の section（親の page-section を拾わない） */
function reportSectionForForm(form: Locator): Locator {
  return form.locator('xpath=ancestor::section[1]');
}

function dailyReportSection(page: Page): Locator {
  return reportSectionForForm(dailyReportForm(page));
}

function weeklyReportSection(page: Page): Locator {
  return reportSectionForForm(weeklyReportForm(page));
}

function reportListFilterForm(page: Page): Locator {
  return page.getByRole('form', { name: REPORT_LIST_FILTER_FORM_ARIA_LABEL });
}

export async function expectTraineeReportPageReady(page: Page): Promise<void> {
  await expect(page).toHaveURL(new RegExp(`${REPORT_PAGE_PATH}$`));
  await expectHeadingVisible(page, TRAINEE_REPORT_PAGE_TITLE);
}

async function expectReportFormReady(
  page: Page,
  formPage: ReportFormPageDescriptor,
): Promise<void> {
  await expectTraineeReportPageReady(page);
  await expect(
    page.getByRole('heading', { name: formPage.title, level: 2 }),
  ).toBeVisible();
  const form = page.getByRole('form', { name: formPage.title });
  await expect(form).toBeVisible();
  // 既存報告の GET 反映が完了し、入力可能になるまで待つ（入力との競合防止）
  await expect(form.getByLabel(formPage.firstFieldLabel)).toBeEnabled();
}

async function openReportFormPage(
  page: Page,
  formPage: ReportFormPageDescriptor,
): Promise<void> {
  await page.goto(formPage.path);
  await expectReportFormReady(page, formPage);
}

export async function openTraineeHomePage(page: Page): Promise<void> {
  await openPageWithHeading(page, TRAINEE_HOME_PATH, TRAINEE_HOME_PAGE_TITLE);
}

/** メインナビの「ホーム」リンクで新卒ホームへ戻る（E-R06） */
export async function navigateBackToTraineeHome(page: Page): Promise<void> {
  await clickMainNavLink(page, TRAINEE_HOME_NAV_LINK_NAME);
  await expectHeadingVisible(page, TRAINEE_HOME_PAGE_TITLE);
}

/** 新卒ホームのヘッダー「報告書」から `/reports` へ遷移する（E-R06） */
export async function navigateFromTraineeHomeToReports(
  page: Page,
): Promise<void> {
  await clickMainNavLink(page, REPORT_HEADER_NAV_LABEL);
  await expectTraineeReportPageReady(page);
}

/** 新卒ホームのヘッダー「報告書」から日次入力欄が利用できる状態へ遷移する（E-R06） */
export async function navigateFromTraineeHomeToDailyReport(
  page: Page,
): Promise<void> {
  await navigateFromTraineeHomeToReports(page);
  await expectReportFormReady(page, DAILY_REPORT_FORM_PAGE);
}

/** `/reports` に日次・週次入力欄と各一覧リンクが揃っていることを検証する（E-R06） */
export async function expectTraineeReportsPageWithFormsAndLinks(
  page: Page,
): Promise<void> {
  await expectTraineeReportPageReady(page);
  await expectReportFormReady(page, DAILY_REPORT_FORM_PAGE);
  await expectReportFormReady(page, WEEKLY_REPORT_FORM_PAGE);
  await expect(
    page.getByRole('link', { name: DAILY_REPORT_LIST_LINK_LABEL }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: WEEKLY_REPORT_LIST_LINK_LABEL }),
  ).toBeVisible();
}

export async function openDailyReportPage(page: Page): Promise<void> {
  await openReportFormPage(page, DAILY_REPORT_FORM_PAGE);
}

export async function openWeeklyReportPage(page: Page): Promise<void> {
  await openReportFormPage(page, WEEKLY_REPORT_FORM_PAGE);
}

function reportField<TKey extends string>(
  page: Page,
  labels: Record<TKey, string>,
  fieldKey: TKey,
): Locator {
  return page.getByLabel(labels[fieldKey]);
}

async function fillReportFields<TKey extends string>(
  page: Page,
  labels: Record<TKey, string>,
  values: Partial<Record<TKey, string>>,
): Promise<void> {
  await forEachProvidedField(values, async (key, value) => {
    await reportField(page, labels, key).fill(value);
  });
}

async function expectReportFieldValues<TKey extends string>(
  page: Page,
  labels: Record<TKey, string>,
  values: Partial<Record<TKey, string>>,
): Promise<void> {
  await forEachProvidedField(values, async (key, value) => {
    await expect(reportField(page, labels, key)).toHaveValue(value);
  });
}

export function dailyReportField(
  page: Page,
  fieldKey: DailyReportFieldKey,
): Locator {
  return reportField(page, DAILY_REPORT_FIELD_LABELS, fieldKey);
}

export function weeklyReportField(
  page: Page,
  fieldKey: WeeklyReportFieldKey,
): Locator {
  return reportField(page, WEEKLY_REPORT_FIELD_LABELS, fieldKey);
}

export async function fillDailyReportFields(
  page: Page,
  values: PartialDailyReportFieldValues,
): Promise<void> {
  await fillReportFields(page, DAILY_REPORT_FIELD_LABELS, values);
}

export async function fillWeeklyReportFields(
  page: Page,
  values: PartialWeeklyReportFieldValues,
): Promise<void> {
  await fillReportFields(page, WEEKLY_REPORT_FIELD_LABELS, values);
}

export async function expectDailyReportFieldValues(
  page: Page,
  values: PartialDailyReportFieldValues,
): Promise<void> {
  await expectReportFieldValues(page, DAILY_REPORT_FIELD_LABELS, values);
}

export async function expectWeeklyReportFieldValues(
  page: Page,
  values: PartialWeeklyReportFieldValues,
): Promise<void> {
  await expectReportFieldValues(page, WEEKLY_REPORT_FIELD_LABELS, values);
}

function isMatchingPutResponse(
  response: Response,
  pathnamePattern: RegExp,
): boolean {
  const pathname = new URL(response.url()).pathname;
  return (
    response.request().method() === 'PUT' && pathnamePattern.test(pathname)
  );
}

async function clickReportPersistAndWait(
  page: Page,
  section: Locator,
  options: {
    buttonLabel: string;
    successMessage: string;
    putPathPattern: RegExp;
  },
): Promise<Response> {
  const responsePromise = page.waitForResponse(
    (response) =>
      isMatchingPutResponse(response, options.putPathPattern) && response.ok(),
  );

  await section.getByRole('button', { name: options.buttonLabel }).click();

  const response = await responsePromise;
  await expect(page.getByText(options.successMessage)).toBeVisible();
  return response;
}

export async function saveDailyReportDraft(page: Page): Promise<Response> {
  return clickReportPersistAndWait(page, dailyReportSection(page), {
    buttonLabel: DAILY_REPORT_DRAFT_SAVE_BUTTON_LABEL,
    successMessage: DAILY_REPORT_DRAFT_SAVE_SUCCESS_MESSAGE,
    putPathPattern: DAILY_REPORT_PUT_PATH_PATTERN,
  });
}

export async function submitDailyReport(page: Page): Promise<Response> {
  return clickReportPersistAndWait(page, dailyReportSection(page), {
    buttonLabel: REPORT_SUBMIT_BUTTON_LABEL,
    successMessage: REPORT_SUBMIT_SUCCESS_MESSAGE,
    putPathPattern: DAILY_REPORT_PUT_PATH_PATTERN,
  });
}

export async function submitWeeklyReport(page: Page): Promise<Response> {
  return clickReportPersistAndWait(page, weeklyReportSection(page), {
    buttonLabel: REPORT_SUBMIT_BUTTON_LABEL,
    successMessage: REPORT_SUBMIT_SUCCESS_MESSAGE,
    putPathPattern: WEEKLY_REPORT_PUT_PATH_PATTERN,
  });
}

/**
 * 日次報告を提出し、バリデーション失敗（HTTP 400）とエラー表示を検証する（E-R09）。
 */
export async function submitDailyReportExpectingValidationError(
  page: Page,
): Promise<Response> {
  const responsePromise = page.waitForResponse((response) =>
    isMatchingPutResponse(response, DAILY_REPORT_PUT_PATH_PATTERN),
  );

  await dailyReportSection(page)
    .getByRole('button', { name: REPORT_SUBMIT_BUTTON_LABEL })
    .click();

  const response = await responsePromise;
  expect(response.status()).toBe(400);
  await expect(page.getByRole('alert')).toHaveText(
    DAILY_REPORT_DONE_TODAY_REQUIRED_MESSAGE,
  );
  await expect(page.getByText(REPORT_SUBMIT_SUCCESS_MESSAGE)).toHaveCount(0);
  return response;
}

export async function expectReportResponseStatus(
  response: Response,
  status: ReportApiStatus,
): Promise<void> {
  const body = (await response.json()) as ReportStatusResponseBody;
  expect(body.status).toBe(status);
}

export async function openTrainerDashboardPage(page: Page): Promise<void> {
  await openPageWithHeading(
    page,
    TRAINER_DASHBOARD_PATH,
    TRAINER_DASHBOARD_PAGE_TITLE,
  );
}

/** ダッシュボードのヘッダー「報告書」から報告一覧へ遷移する（E-R07） */
export async function navigateFromTrainerDashboardToReportList(
  page: Page,
): Promise<void> {
  await clickMainNavLink(page, REPORT_HEADER_NAV_LABEL);
  await expectHeadingVisible(page, REPORT_LIST_PAGE_TITLE);
}

/** ダッシュボードに「報告書一覧」リンクがないことを検証する（E-R07 / U-R42） */
export async function expectDashboardHasNoReportListLink(
  page: Page,
): Promise<void> {
  await expect(
    page.getByRole('link', { name: REPORT_LIST_PAGE_TITLE }),
  ).toHaveCount(0);
}

export async function openReportListPage(page: Page): Promise<void> {
  await openPageWithHeading(page, REPORT_LIST_PATH, REPORT_LIST_PAGE_TITLE);
}

/** トレーナー一覧から報告詳細へ遷移する（P-R01） */
export async function openTrainerReportDetail(
  page: Page,
  periodKey: string,
): Promise<void> {
  await page.getByRole('link', { name: periodKey }).click();
  await expectHeadingVisible(page, REPORT_DETAIL_PAGE_TITLE);
  await expect(page.getByRole('region', { name: periodKey })).toBeVisible();
}

/** 報告詳細ページをパス指定で開く（新卒の確認用 / P-R01） */
export async function openReportDetailPage(
  page: Page,
  detailPath: string,
): Promise<void> {
  await page.goto(detailPath);
  await expectHeadingVisible(page, REPORT_DETAIL_PAGE_TITLE);
}

function isReportCommentPostResponse(response: Response): boolean {
  if (response.request().method() !== 'POST' || !response.ok()) {
    return false;
  }

  const pathname = new URL(response.url()).pathname;
  return /^\/api\/reports\/[^/]+\/comments$/.test(pathname);
}

/**
 * トレーナーが報告詳細でコメントを入力・送信し、POST 完了を待つ（P-R01）。
 */
export async function submitTrainerReportComment(
  page: Page,
  comment: string,
): Promise<Response> {
  const responsePromise = page.waitForResponse(isReportCommentPostResponse);

  await page
    .getByLabel(REPORT_COMMENT_FIELD_LABEL, { exact: true })
    .fill(comment);
  await page
    .getByRole('button', { name: REPORT_COMMENT_SUBMIT_BUTTON_LABEL })
    .click();

  return responsePromise;
}

function reportCommentsSection(page: Page): Locator {
  return page.getByRole('region', { name: REPORT_COMMENT_SECTION_LABEL });
}

/** 報告詳細にトレーナーコメントが表示されていることを検証する（P-R01） */
export async function expectReportCommentVisible(
  page: Page,
  comment: string,
): Promise<void> {
  await expect(reportCommentsSection(page).getByText(comment)).toBeVisible();
}

/** 報告詳細に指定コメントが表示されないことを検証する（P-R02） */
export async function expectReportCommentNotVisible(
  page: Page,
  comment: string,
): Promise<void> {
  await expect(reportCommentsSection(page).getByText(comment)).toHaveCount(0);
}

function isReportCommentPutResponse(response: Response): boolean {
  if (response.request().method() !== 'PUT' || !response.ok()) {
    return false;
  }

  const pathname = new URL(response.url()).pathname;
  return /^\/api\/reports\/[^/]+\/comments\/[^/]+$/.test(pathname);
}

/** 既存コメントの編集を開始する（P-R02） */
export async function startEditTrainerReportComment(
  page: Page,
  existingComment: string,
): Promise<void> {
  await reportCommentsSection(page)
    .getByRole('listitem')
    .filter({ hasText: existingComment })
    .getByRole('button', { name: REPORT_COMMENT_EDIT_BUTTON_LABEL })
    .click();

  await expect(
    page.getByLabel(REPORT_COMMENT_EDIT_FIELD_LABEL, { exact: true }),
  ).toBeVisible();
}

/**
 * 編集中のコメントを更新し、PUT 完了を待つ（P-R02）。
 * 事前に startEditTrainerReportComment を呼ぶこと。
 */
export async function updateTrainerReportComment(
  page: Page,
  nextComment: string,
): Promise<Response> {
  const responsePromise = page.waitForResponse(isReportCommentPutResponse);

  await page
    .getByLabel(REPORT_COMMENT_EDIT_FIELD_LABEL, { exact: true })
    .fill(nextComment);
  await page
    .getByRole('button', { name: REPORT_COMMENT_UPDATE_BUTTON_LABEL })
    .click();

  return responsePromise;
}

/** トレーナー一覧上の報告カード（aria-label = periodKey） */
export function trainerReportCard(page: Page, periodKey: string): Locator {
  return page.getByRole('article', { name: periodKey });
}

async function expectReportCardFieldValues(
  card: Locator,
  values: Record<string, string>,
): Promise<void> {
  await expect(card).toBeVisible();

  await forEachProvidedField(values, async (_key, value) => {
    await expect(card.getByText(value)).toBeVisible();
  });
}

/**
 * トレーナーの報告書一覧に、指定日次報告の全項目が表示されていることを検証する（E-R02）。
 */
export async function expectTrainerDailyReportContent(
  page: Page,
  periodKey: string,
  values: DailyReportFieldValues,
): Promise<void> {
  await expectReportCardFieldValues(trainerReportCard(page, periodKey), values);
}

/**
 * トレーナーの報告書一覧に、指定週次報告の全項目が表示されていることを検証する（E-R03）。
 */
export async function expectTrainerWeeklyReportContent(
  page: Page,
  periodKey: string,
  values: WeeklyReportFieldValues,
): Promise<void> {
  await expectReportCardFieldValues(trainerReportCard(page, periodKey), values);
}

/** トレーナー一覧上の指定 periodKey の報告件数を検証する（E-R04 / E-R05: 1 件制約） */
export async function expectTrainerReportCount(
  page: Page,
  periodKey: string,
  count: number,
): Promise<void> {
  await expect(trainerReportCard(page, periodKey)).toHaveCount(count);
}

export interface SeededPastDailyReport {
  periodKey: string;
  content: DailyReportFieldValues;
}

export interface SeededPastWeeklyReport {
  periodKey: string;
  content: WeeklyReportFieldValues;
}

/** E-R08 用の過去日次報告フィクスチャを生成する */
export function createPastDailyReportFixture(
  daysAgo: number,
  labelPrefix: string,
): SeededPastDailyReport {
  return {
    periodKey: formatDailyReportPeriodKeyDaysAgo(daysAgo),
    content: {
      doneToday: `${labelPrefix} ${daysAgo}日前 本日やったこと`,
      learnedToday: `${labelPrefix} ${daysAgo}日前 学んだこと`,
      blockers: `${labelPrefix} ${daysAgo}日前 困っていること`,
      planTomorrow: `${labelPrefix} ${daysAgo}日前 明日やること`,
    },
  };
}

/** daysAgo を古い日→新しい日の順で受け取り、過去日次報告配列を作る */
export function buildPastDailyReportsOldestFirst(
  daysAgoOldestFirst: readonly number[],
  labelPrefix: string,
): SeededPastDailyReport[] {
  return daysAgoOldestFirst.map((daysAgo) =>
    createPastDailyReportFixture(daysAgo, labelPrefix),
  );
}

/** 新卒認証で日次報告を API PUT する（過去日の前提データ投入用 / E-R08） */
export async function putTraineeDailyReportViaApi(
  request: APIRequestContext,
  report: SeededPastDailyReport,
): Promise<void> {
  const response = await request.put(`/api/reports/daily/${report.periodKey}`, {
    headers: TRAINEE_API_HEADERS,
    data: {
      status: 'submitted',
      content: report.content,
    },
  });
  expect(response.ok()).toBeTruthy();
}

/**
 * 過去日次報告を古い日→新しい日の順で投入する。
 * updatedAt 降順ソートでも periodKey 新しい順と一致させるため。
 */
export async function seedPastDailyReportsViaApi(
  request: APIRequestContext,
  reportsOldestFirst: readonly SeededPastDailyReport[],
): Promise<void> {
  for (const report of reportsOldestFirst) {
    await putTraineeDailyReportViaApi(request, report);
  }
}

/** 新卒認証で週次報告を API PUT する（E-R10 前提データ投入用） */
export async function putTraineeWeeklyReportViaApi(
  request: APIRequestContext,
  report: SeededPastWeeklyReport,
): Promise<void> {
  const response = await request.put(
    `/api/reports/weekly/${report.periodKey}`,
    {
      headers: TRAINEE_API_HEADERS,
      data: {
        status: 'submitted',
        content: report.content,
      },
    },
  );
  expect(response.ok()).toBeTruthy();
}

function isReportsListGetResponse(
  response: Response,
  reportType:
    | typeof REPORT_TYPE_FILTER_VALUE_DAILY
    | typeof REPORT_TYPE_FILTER_VALUE_WEEKLY,
): boolean {
  if (response.request().method() !== 'GET' || !response.ok()) {
    return false;
  }

  const url = new URL(response.url());
  return (
    url.pathname === '/api/reports' &&
    url.searchParams.get('type') === reportType
  );
}

/**
 * トレーナー報告一覧で種別フィルタを選択し、type 付き GET 完了を待つ（E-R10）。
 */
export async function filterTrainerReportsByType(
  page: Page,
  reportType:
    | typeof REPORT_TYPE_FILTER_VALUE_DAILY
    | typeof REPORT_TYPE_FILTER_VALUE_WEEKLY,
): Promise<Response> {
  const responsePromise = page.waitForResponse((response) =>
    isReportsListGetResponse(response, reportType),
  );

  await page.getByLabel(REPORT_TYPE_FILTER_LABEL).selectOption(reportType);

  return responsePromise;
}

function pastDailyReportsSection(page: Page): Locator {
  return page.getByRole('region', { name: PAST_DAILY_REPORTS_SECTION_LABEL });
}

function pastWeeklyReportsSection(page: Page): Locator {
  return page.getByRole('region', { name: PAST_WEEKLY_REPORTS_SECTION_LABEL });
}

export async function openDailyReportListPage(page: Page): Promise<void> {
  await page.goto(DAILY_REPORT_LIST_PATH);
  await expectHeadingVisible(page, DAILY_REPORT_LIST_PAGE_TITLE);
}

export async function openWeeklyReportListPage(page: Page): Promise<void> {
  await page.goto(WEEKLY_REPORT_LIST_PATH);
  await expectHeadingVisible(page, WEEKLY_REPORT_LIST_PAGE_TITLE);
}

/** `/reports` から日次報告書一覧へ遷移する（E-R08） */
export async function navigateFromReportsPageToDailyReportList(
  page: Page,
): Promise<void> {
  await page.getByRole('link', { name: DAILY_REPORT_LIST_LINK_LABEL }).click();
  await expect(page).toHaveURL(new RegExp(`${DAILY_REPORT_LIST_PATH}$`));
  await expectHeadingVisible(page, DAILY_REPORT_LIST_PAGE_TITLE);
}

/** 廃止ルートが `/reports` へリダイレクトされることを検証する（E-R12） */
export async function expectLegacyReportPathRedirectsToReports(
  page: Page,
  legacyPath: string,
): Promise<void> {
  await page.goto(legacyPath);
  await expect(page).toHaveURL(new RegExp(`${REPORT_PAGE_PATH}$`));
  await expectTraineeReportPageReady(page);
}

export interface ReportListFilterValues {
  readonly q?: string;
  readonly from?: string;
  readonly to?: string;
  readonly date?: string;
}

interface FillReportListFilterOptions {
  readonly dateFieldLabel?: string;
}

/** 報告書一覧の絞り込みフォームに値を入力する（E-R13 / E-R14 / E-R15） */
export async function fillReportListFilter(
  page: Page,
  values: ReportListFilterValues,
  options: FillReportListFilterOptions = {},
): Promise<void> {
  const form = reportListFilterForm(page);
  const dateFieldLabel = options.dateFieldLabel ?? REPORT_LIST_DATE_LABEL;

  if (values.q !== undefined) {
    await form.getByLabel(REPORT_LIST_SEARCH_LABEL).fill(values.q);
  }
  if (values.from !== undefined) {
    await form.getByLabel(REPORT_LIST_FROM_LABEL).fill(values.from);
  }
  if (values.to !== undefined) {
    await form.getByLabel(REPORT_LIST_TO_LABEL).fill(values.to);
  }
  if (values.date !== undefined) {
    await form.getByLabel(dateFieldLabel).fill(values.date);
  }
}

function isOwnDailyReportsListGet(response: Response): boolean {
  if (response.request().method() !== 'GET' || !response.ok()) {
    return false;
  }

  return new URL(response.url()).pathname === '/api/reports/daily';
}

function isOwnWeeklyReportsListGet(response: Response): boolean {
  if (response.request().method() !== 'GET' || !response.ok()) {
    return false;
  }

  return new URL(response.url()).pathname === '/api/reports/weekly';
}

/** 日次一覧の絞り込みを実行し GET 完了を待つ（E-R13） */
export async function applyDailyReportListFilter(
  page: Page,
): Promise<Response> {
  const responsePromise = page.waitForResponse(isOwnDailyReportsListGet);
  await reportListFilterForm(page)
    .getByRole('button', { name: REPORT_LIST_FILTER_BUTTON_LABEL })
    .click();
  return responsePromise;
}

/** 週次一覧の絞り込みを実行し GET 完了を待つ（E-R14） */
export async function applyWeeklyReportListFilter(
  page: Page,
): Promise<Response> {
  const responsePromise = page.waitForResponse(isOwnWeeklyReportsListGet);
  await reportListFilterForm(page)
    .getByRole('button', { name: REPORT_LIST_FILTER_BUTTON_LABEL })
    .click();
  return responsePromise;
}

/** 絞り込みフォームを送信する（API 呼び出しを待たない / E-R15） */
export async function submitReportListFilter(page: Page): Promise<void> {
  await reportListFilterForm(page)
    .getByRole('button', { name: REPORT_LIST_FILTER_BUTTON_LABEL })
    .click();
}

/** 期間条件同時指定のエラー表示を検証する（E-R15） */
export async function expectReportListFilterConflictError(
  page: Page,
): Promise<void> {
  await expect(page.getByRole('alert')).toHaveText(
    REPORT_PERIOD_FILTER_CONFLICT_MESSAGE,
  );
}

/** 日次一覧に指定 periodKey の報告が表示されていることを検証する */
export async function expectPastDailyReportPeriodKeysVisible(
  page: Page,
  periodKeys: readonly string[],
): Promise<void> {
  const section = pastDailyReportsSection(page);

  for (const periodKey of periodKeys) {
    await expect(
      section.getByRole('article', { name: periodKey }),
    ).toBeVisible();
  }
}

/** 日次一覧に指定 periodKey の報告が表示されていないことを検証する */
export async function expectPastDailyReportPeriodKeysNotVisible(
  page: Page,
  periodKeys: readonly string[],
): Promise<void> {
  const section = pastDailyReportsSection(page);

  for (const periodKey of periodKeys) {
    await expect(section.getByRole('article', { name: periodKey })).toHaveCount(
      0,
    );
  }
}

/** 週次一覧に指定 periodKey の報告が表示されていることを検証する */
export async function expectPastWeeklyReportPeriodKeysVisible(
  page: Page,
  periodKeys: readonly string[],
): Promise<void> {
  const section = pastWeeklyReportsSection(page);

  for (const periodKey of periodKeys) {
    await expect(
      section.getByRole('article', { name: periodKey }),
    ).toBeVisible();
  }
}

/** 週次一覧に指定 periodKey の報告が表示されていないことを検証する */
export async function expectPastWeeklyReportPeriodKeysNotVisible(
  page: Page,
  periodKeys: readonly string[],
): Promise<void> {
  const section = pastWeeklyReportsSection(page);

  for (const periodKey of periodKeys) {
    await expect(section.getByRole('article', { name: periodKey })).toHaveCount(
      0,
    );
  }
}

/** expectedOrder の各要素が sequence 上でその相対順で現れることを検証する */
function expectItemsInRelativeOrder(
  sequence: readonly string[],
  expectedOrder: readonly string[],
): void {
  const indices = expectedOrder.map((item) => sequence.indexOf(item));

  for (const index of indices) {
    expect(index).toBeGreaterThanOrEqual(0);
  }

  for (let i = 0; i < indices.length - 1; i += 1) {
    expect(indices[i]).toBeLessThan(indices[i + 1]!);
  }
}

/**
 * 過去日次報告欄に指定報告が表示され、periodKey が新しい順であることを検証する（E-R08）。
 */
export async function expectPastDailyReportsNewestFirst(
  page: Page,
  reportsNewestFirst: readonly SeededPastDailyReport[],
): Promise<void> {
  const section = pastDailyReportsSection(page);
  await expect(section).toBeVisible();

  for (const report of reportsNewestFirst) {
    await expectReportCardFieldValues(
      section.getByRole('article', { name: report.periodKey }),
      report.content,
    );
  }

  const periodKeysInDom = await section
    .getByRole('article')
    .evaluateAll((articles) =>
      articles.map((article) => article.getAttribute('aria-label') ?? ''),
    );

  expectItemsInRelativeOrder(
    periodKeysInDom,
    reportsNewestFirst.map((report) => report.periodKey),
  );
}
