import { ReportInvalidInputError } from '../domain/errors.js';
import { isValidDailyPeriodKey } from './reportDailyPeriodKey.js';
import { isValidWeeklyPeriodKey } from './reportWeeklyPeriodKey.js';
import { REPORT_TYPE_DAILY, type ReportType } from './reportConstants.js';
import type { Report } from './reportTypes.js';

/** BR-R15: 期間の範囲指定と特定日の同時指定エラー */
export const REPORT_PERIOD_FILTER_CONFLICT_MESSAGE =
  '期間の範囲指定と特定日は同時に使えません。どちらか一方だけを指定してください。' as const;

export interface OwnReportListQuery {
  q?: string;
  from?: string;
  to?: string;
  date?: string;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** `YYYY-MM-DD` を ISO 週キー `YYYY-Www` に変換する */
export function dailyDateToIsoWeekKey(dailyDate: string): string {
  const [year, month, day] = dailyDate.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const isoYear = date.getUTCFullYear();
  const yearStart = new Date(Date.UTC(isoYear, 0, 1));
  const weekNo = Math.ceil(
    ((date.getTime() - yearStart.getTime()) / MS_PER_DAY + 1) / 7,
  );

  return `${isoYear}-W${String(weekNo).padStart(2, '0')}`;
}

function normalizeWeeklyBound(value: string): string | null {
  if (isValidWeeklyPeriodKey(value)) {
    return value;
  }

  if (isValidDailyPeriodKey(value)) {
    return dailyDateToIsoWeekKey(value);
  }

  return null;
}

function normalizeDailyBound(value: string): string | null {
  return isValidDailyPeriodKey(value) ? value : null;
}

function assertValidPeriodBounds(
  reportType: ReportType,
  query: OwnReportListQuery,
): void {
  const hasRange = query.from !== undefined || query.to !== undefined;
  const hasDate = query.date !== undefined;

  if (hasRange && hasDate) {
    throw new ReportInvalidInputError(REPORT_PERIOD_FILTER_CONFLICT_MESSAGE);
  }

  if (query.date !== undefined) {
    const valid =
      reportType === REPORT_TYPE_DAILY
        ? isValidDailyPeriodKey(query.date)
        : normalizeWeeklyBound(query.date) !== null;

    if (!valid) {
      throw new ReportInvalidInputError();
    }
  }

  if (query.from !== undefined) {
    const normalized =
      reportType === REPORT_TYPE_DAILY
        ? normalizeDailyBound(query.from)
        : normalizeWeeklyBound(query.from);

    if (!normalized) {
      throw new ReportInvalidInputError();
    }
  }

  if (query.to !== undefined) {
    const normalized =
      reportType === REPORT_TYPE_DAILY
        ? normalizeDailyBound(query.to)
        : normalizeWeeklyBound(query.to);

    if (!normalized) {
      throw new ReportInvalidInputError();
    }
  }
}

/** BR-R12: content の全テキストフィールドを結合して部分一致 */
export function reportContentIncludesQuery(
  report: Report,
  searchQuery: string,
): boolean {
  if (searchQuery.length === 0) {
    return true;
  }

  const haystack = Object.values(report.content).join('\n');
  return haystack.includes(searchQuery);
}

function matchesPeriodFilter(
  report: Report,
  reportType: ReportType,
  query: OwnReportListQuery,
): boolean {
  if (query.date !== undefined) {
    if (reportType === REPORT_TYPE_DAILY) {
      return report.periodKey === query.date;
    }

    const targetWeek = normalizeWeeklyBound(query.date);
    return targetWeek !== null && report.periodKey === targetWeek;
  }

  let fromBound: string | undefined;
  let toBound: string | undefined;

  if (query.from !== undefined) {
    fromBound =
      reportType === REPORT_TYPE_DAILY
        ? (normalizeDailyBound(query.from) ?? undefined)
        : (normalizeWeeklyBound(query.from) ?? undefined);
  }

  if (query.to !== undefined) {
    toBound =
      reportType === REPORT_TYPE_DAILY
        ? (normalizeDailyBound(query.to) ?? undefined)
        : (normalizeWeeklyBound(query.to) ?? undefined);
  }

  if (fromBound !== undefined && report.periodKey < fromBound) {
    return false;
  }

  if (toBound !== undefined && report.periodKey > toBound) {
    return false;
  }

  return true;
}

export function filterOwnReports(
  reports: Report[],
  reportType: ReportType,
  query: OwnReportListQuery,
): Report[] {
  assertValidPeriodBounds(reportType, query);

  return reports.filter((report) => {
    if (report.type !== reportType) {
      return false;
    }

    if (query.q !== undefined && !reportContentIncludesQuery(report, query.q)) {
      return false;
    }

    return matchesPeriodFilter(report, reportType, query);
  });
}
