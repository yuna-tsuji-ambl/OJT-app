import type { AuthUser } from '../auth/types';
import type {
  DailyReportResponse,
  OwnReportListQuery,
  PostReportCommentInput,
  PutDailyReportInput,
  PutWeeklyReportInput,
  ReportCommentResponse,
  ReportFormType,
  ReportResponse,
  WeeklyReportResponse,
} from '../domain/reportForm';
import { fetchWithAuth } from './authHeaders';
import { parseJsonResponse, parseOptionalJsonResponse } from './jsonResponse';

const REPORTS_API_PATH = '/api/reports';
const DAILY_REPORT_API_BASE_PATH = '/api/reports/daily';
const WEEKLY_REPORT_API_BASE_PATH = '/api/reports/weekly';

export interface FetchReportsOptions extends OwnReportListQuery {
  readonly reportType?: ReportFormType;
}

function buildOwnedReportApiPath(basePath: string, periodKey: string): string {
  return `${basePath}/${periodKey}`;
}

function buildReportsListApiPath(
  traineeId: string,
  options: FetchReportsOptions = {},
): string {
  const query = new URLSearchParams({ traineeId });
  if (options.reportType) {
    query.set('type', options.reportType);
  }
  if (options.q !== undefined && options.q.length > 0) {
    query.set('q', options.q);
  }
  if (options.from !== undefined && options.from.length > 0) {
    query.set('from', options.from);
  }
  if (options.to !== undefined && options.to.length > 0) {
    query.set('to', options.to);
  }
  if (options.date !== undefined && options.date.length > 0) {
    query.set('date', options.date);
  }
  return `${REPORTS_API_PATH}?${query.toString()}`;
}

function buildReportByIdApiPath(reportId: string): string {
  return `${REPORTS_API_PATH}/${reportId}`;
}

function buildReportCommentsApiPath(reportId: string): string {
  return `${buildReportByIdApiPath(reportId)}/comments`;
}

function buildReportCommentByIdApiPath(
  reportId: string,
  commentId: string,
): string {
  return `${buildReportCommentsApiPath(reportId)}/${commentId}`;
}

function createOwnedReportClient<TReport, TInput>(options: {
  basePath: string;
  fetchErrorMessage: string;
  putErrorMessage: string;
}) {
  return {
    async fetch(periodKey: string, user: AuthUser): Promise<TReport | null> {
      const response = await fetchWithAuth(
        buildOwnedReportApiPath(options.basePath, periodKey),
        user,
      );
      return parseOptionalJsonResponse<TReport>(
        response,
        options.fetchErrorMessage,
      );
    },
    async put(
      periodKey: string,
      input: TInput,
      user: AuthUser,
    ): Promise<TReport> {
      const response = await fetchWithAuth(
        buildOwnedReportApiPath(options.basePath, periodKey),
        user,
        {
          method: 'PUT',
          body: JSON.stringify(input),
        },
      );
      return parseJsonResponse<TReport>(response, options.putErrorMessage);
    },
  };
}

async function fetchOwnReportsList<TReport>(
  basePath: string,
  user: AuthUser,
  errorMessage: string,
  query: OwnReportListQuery = {},
): Promise<readonly TReport[]> {
  const params = new URLSearchParams();
  if (query.q !== undefined && query.q.length > 0) {
    params.set('q', query.q);
  }
  if (query.from !== undefined && query.from.length > 0) {
    params.set('from', query.from);
  }
  if (query.to !== undefined && query.to.length > 0) {
    params.set('to', query.to);
  }
  if (query.date !== undefined && query.date.length > 0) {
    params.set('date', query.date);
  }

  const queryString = params.toString();
  const path = queryString ? `${basePath}?${queryString}` : basePath;
  const response = await fetchWithAuth(path, user);

  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    const apiError =
      typeof body === 'object' &&
      body !== null &&
      'error' in body &&
      typeof body.error === 'string'
        ? body.error
        : errorMessage;
    throw new Error(apiError);
  }

  return response.json() as Promise<readonly TReport[]>;
}

const dailyReportClient = createOwnedReportClient<
  DailyReportResponse,
  PutDailyReportInput
>({
  basePath: DAILY_REPORT_API_BASE_PATH,
  fetchErrorMessage: 'Failed to fetch daily report',
  putErrorMessage: 'Failed to save daily report',
});

const weeklyReportClient = createOwnedReportClient<
  WeeklyReportResponse,
  PutWeeklyReportInput
>({
  basePath: WEEKLY_REPORT_API_BASE_PATH,
  fetchErrorMessage: 'Failed to fetch weekly report',
  putErrorMessage: 'Failed to save weekly report',
});

export const fetchDailyReport = dailyReportClient.fetch;
export const putDailyReport = dailyReportClient.put;
export const fetchWeeklyReport = weeklyReportClient.fetch;
export const putWeeklyReport = weeklyReportClient.put;

/** ログイン中の新卒の過去日次報告一覧を取得する（UC-R03 / BR-R12〜R15） */
export async function fetchOwnDailyReports(
  user: AuthUser,
  query: OwnReportListQuery = {},
): Promise<readonly DailyReportResponse[]> {
  return fetchOwnReportsList(
    DAILY_REPORT_API_BASE_PATH,
    user,
    'Failed to fetch own daily reports',
    query,
  );
}

/** ログイン中の新卒の過去週次報告一覧を取得する（UC-R03 / BR-R12〜R15） */
export async function fetchOwnWeeklyReports(
  user: AuthUser,
  query: OwnReportListQuery = {},
): Promise<readonly WeeklyReportResponse[]> {
  return fetchOwnReportsList(
    WEEKLY_REPORT_API_BASE_PATH,
    user,
    'Failed to fetch own weekly reports',
    query,
  );
}

/** トレーナー向け担当新卒の報告一覧を取得する（UC-R04 / §8.6.2） */
export async function fetchReports(
  traineeId: string,
  user: AuthUser,
  options: FetchReportsOptions = {},
): Promise<readonly ReportResponse[]> {
  const response = await fetchWithAuth(
    buildReportsListApiPath(traineeId, options),
    user,
  );
  return parseJsonResponse(response, 'Failed to fetch reports');
}

/** 報告詳細を取得する（§8.6.2 / U-R36） */
export async function fetchReportById(
  reportId: string,
  user: AuthUser,
): Promise<ReportResponse> {
  const response = await fetchWithAuth(buildReportByIdApiPath(reportId), user);
  return parseJsonResponse(response, 'Failed to fetch report');
}

/** トレーナーが報告にコメントする（UC-R05 / P-R01） */
export async function postReportComment(
  reportId: string,
  input: PostReportCommentInput,
  user: AuthUser,
): Promise<ReportCommentResponse> {
  const response = await fetchWithAuth(
    buildReportCommentsApiPath(reportId),
    user,
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
  );
  return parseJsonResponse(response, 'Failed to post report comment');
}

/** トレーナーが報告コメントを更新する（UC-R05 / P-R02） */
export async function putReportComment(
  reportId: string,
  commentId: string,
  input: PostReportCommentInput,
  user: AuthUser,
): Promise<ReportCommentResponse> {
  const response = await fetchWithAuth(
    buildReportCommentByIdApiPath(reportId, commentId),
    user,
    {
      method: 'PUT',
      body: JSON.stringify(input),
    },
  );
  return parseJsonResponse(response, 'Failed to update report comment');
}
