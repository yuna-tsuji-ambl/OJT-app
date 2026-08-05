import { ensureTrainee } from '../domain/authorization.js';
import type { UserContext } from '../domain/types.js';
import type { ReportRepository } from '../repositories/reportRepository.js';
import type { ReportType } from './reportConstants.js';
import {
  ensureReportDetailAccess,
  ensureTrainerCanListReportsForTrainee,
} from './reportAccess.js';
import { normalizeReportComments } from './reportComments.js';
import { listTraineeReports, requireReportById } from './reportQueries.js';
import { ReportInvalidInputError } from '../domain/errors.js';
import {
  filterOwnReports,
  reportContentIncludesQuery,
  type OwnReportListQuery,
} from './reportOwnListQuery.js';
import type { ListReportsCriteria, Report } from './reportTypes.js';

function toOwnReportListQuery(
  criteria: ListReportsCriteria,
): OwnReportListQuery {
  const query: OwnReportListQuery = {};
  if (criteria.q !== undefined) {
    query.q = criteria.q;
  }
  if (criteria.from !== undefined) {
    query.from = criteria.from;
  }
  if (criteria.to !== undefined) {
    query.to = criteria.to;
  }
  if (criteria.date !== undefined) {
    query.date = criteria.date;
  }
  return query;
}

function hasOwnReportListQuery(query: OwnReportListQuery): boolean {
  return (
    query.q !== undefined ||
    query.from !== undefined ||
    query.to !== undefined ||
    query.date !== undefined
  );
}

export async function listReportsCommand(
  criteria: ListReportsCriteria,
  context: UserContext,
  reportRepository: ReportRepository,
): Promise<Report[]> {
  ensureTrainerCanListReportsForTrainee(context, criteria.traineeId);

  const reports = await listTraineeReports(
    reportRepository,
    criteria.traineeId,
    criteria.type,
  );
  const query = toOwnReportListQuery(criteria);

  if (!hasOwnReportListQuery(query)) {
    return reports;
  }

  if (criteria.type !== undefined) {
    return filterOwnReports(reports, criteria.type, query);
  }

  // type なしで期間条件は解釈できない（BR-R13/R14）
  if (
    query.from !== undefined ||
    query.to !== undefined ||
    query.date !== undefined
  ) {
    throw new ReportInvalidInputError();
  }

  if (query.q !== undefined) {
    return reports.filter((report) =>
      reportContentIncludesQuery(report, query.q!),
    );
  }

  return reports;
}

/** 新卒が自分の過去報告一覧を取得する（UC-R03。検索・期間絞り込み対応） */
export async function listOwnReportsCommand(
  reportType: ReportType,
  query: OwnReportListQuery,
  context: UserContext,
  reportRepository: ReportRepository,
): Promise<Report[]> {
  ensureTrainee(context);

  const reports = await listTraineeReports(
    reportRepository,
    context.userId,
    reportType,
  );

  return filterOwnReports(reports, reportType, query);
}

export async function getReportByIdCommand(
  reportId: string,
  context: UserContext,
  reportRepository: ReportRepository,
): Promise<Report> {
  const report = normalizeReportComments(
    await requireReportById(reportRepository, reportId),
  );
  ensureReportDetailAccess(context, report);
  return report;
}
