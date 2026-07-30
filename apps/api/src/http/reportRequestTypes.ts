import type {
  ListReportsCriteria,
  PostReportCommentInput,
  PutDailyReportInput,
  PutReportInput,
  PutReportInputByType,
  PutWeeklyReportInput,
  ReportContentByType,
} from '../reports/reportTypes.js';
import {
  isReportContent,
  isReportStatus,
  isReportType,
} from '../reports/reportContentParsing.js';
import {
  REPORT_CONTENT_FIELDS_BY_TYPE,
  REPORT_TYPE_DAILY,
  REPORT_TYPE_WEEKLY,
  type ReportType,
} from '../reports/reportConstants.js';
import { isUnknownRecord } from './requestParsing.js';
import { readQueryParam } from './expressRouteParams.js';

export type ListReportsQuery = ListReportsCriteria;

export function parseListReportsQuery(query: unknown): ListReportsQuery | null {
  if (!isUnknownRecord(query)) {
    return null;
  }

  const traineeId = readQueryParam(query.traineeId);

  if (!traineeId) {
    return null;
  }

  const typeParam = readQueryParam(query.type);

  if (typeParam === null) {
    return { traineeId };
  }

  if (!isReportType(typeParam)) {
    return null;
  }

  return { traineeId, type: typeParam };
}

export type OwnReportListQueryParams = {
  q?: string;
  from?: string;
  to?: string;
  date?: string;
};

/** 新卒向け過去報告一覧クエリ（`q` / `from` / `to` / `date`） */
export function parseOwnReportListQuery(
  query: unknown,
): OwnReportListQueryParams {
  if (!isUnknownRecord(query)) {
    return {};
  }

  const result: OwnReportListQueryParams = {};
  const q = readQueryParam(query.q);
  const from = readQueryParam(query.from);
  const to = readQueryParam(query.to);
  const date = readQueryParam(query.date);

  if (q !== null) {
    result.q = q;
  }

  if (from !== null) {
    result.from = from;
  }

  if (to !== null) {
    result.to = to;
  }

  if (date !== null) {
    result.date = date;
  }

  return result;
}

function parsePutReportBody<TContent extends Record<string, string>>(
  body: unknown,
  fields: readonly string[],
): PutReportInput<TContent> | null {
  if (!isUnknownRecord(body)) {
    return null;
  }

  if (!isReportStatus(body.status) || !isReportContent(body.content, fields)) {
    return null;
  }

  return {
    status: body.status,
    content: body.content as TContent,
  };
}

function parseOwnedReportBody<TType extends ReportType>(
  body: unknown,
  reportType: TType,
): PutReportInputByType[TType] | null {
  return parsePutReportBody<ReportContentByType[TType]>(
    body,
    REPORT_CONTENT_FIELDS_BY_TYPE[reportType],
  ) as PutReportInputByType[TType] | null;
}

export function parsePutDailyReportBody(
  body: unknown,
): PutDailyReportInput | null {
  return parseOwnedReportBody(body, REPORT_TYPE_DAILY);
}

export function parsePutWeeklyReportBody(
  body: unknown,
): PutWeeklyReportInput | null {
  return parseOwnedReportBody(body, REPORT_TYPE_WEEKLY);
}

/** POST/PUT コメントボディ（P-R01 / P-R02） */
export function parsePostReportCommentBody(
  body: unknown,
): PostReportCommentInput | null {
  if (!isUnknownRecord(body) || typeof body.content !== 'string') {
    return null;
  }

  const content = body.content.trim();
  if (content.length === 0) {
    return null;
  }

  return { content };
}

export const parsePutReportCommentBody = parsePostReportCommentBody;
