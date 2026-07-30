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
import {
  filterOwnReports,
  type OwnReportListQuery,
} from './reportOwnListQuery.js';
import type { ListReportsCriteria, Report } from './reportTypes.js';

export async function listReportsCommand(
  criteria: ListReportsCriteria,
  context: UserContext,
  reportRepository: ReportRepository,
): Promise<Report[]> {
  ensureTrainerCanListReportsForTrainee(context, criteria.traineeId);

  return listTraineeReports(
    reportRepository,
    criteria.traineeId,
    criteria.type,
  );
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
