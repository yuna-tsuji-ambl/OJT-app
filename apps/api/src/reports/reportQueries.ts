import { ReportNotFoundError } from '../domain/errors.js';
import type { ReportRepository } from '../repositories/reportRepository.js';
import type { ReportType } from './reportConstants.js';
import { filterReportsByType } from './filterReportsByType.js';
import { sortReportsNewestFirst } from './sortReportsNewestFirst.js';
import type { OwnedReportByType, Report } from './reportTypes.js';

function requireExistingReport<TReport extends Report>(
  report: TReport | null,
  lookupKey: string,
): TReport {
  if (!report) {
    throw new ReportNotFoundError(lookupKey);
  }

  return report;
}

export async function findOwnedReport<TType extends ReportType>(
  reportRepository: ReportRepository,
  traineeId: string,
  reportType: TType,
  periodKey: string,
): Promise<OwnedReportByType[TType] | null> {
  return reportRepository.findByTraineeTypeAndPeriodKey(
    traineeId,
    reportType,
    periodKey,
  );
}

export async function findReportsForTrainee(
  reportRepository: ReportRepository,
  traineeId: string,
): Promise<Report[]> {
  return reportRepository.findByTraineeId(traineeId);
}

/** 指定新卒の報告を type で絞り込み、更新日時の新しい順に返す */
export async function listTraineeReports(
  reportRepository: ReportRepository,
  traineeId: string,
  reportType?: ReportType,
): Promise<Report[]> {
  const reports = await findReportsForTrainee(reportRepository, traineeId);
  return sortReportsNewestFirst(filterReportsByType(reports, reportType));
}

export async function findReportById(
  reportRepository: ReportRepository,
  reportId: string,
): Promise<Report | null> {
  return reportRepository.findById(reportId);
}

export async function requireReportById(
  reportRepository: ReportRepository,
  reportId: string,
): Promise<Report> {
  const report = await findReportById(reportRepository, reportId);
  return requireExistingReport(report, reportId);
}

export async function requireOwnedReport<TType extends ReportType>(
  reportRepository: ReportRepository,
  traineeId: string,
  reportType: TType,
  periodKey: string,
): Promise<OwnedReportByType[TType]> {
  const report = await findOwnedReport(
    reportRepository,
    traineeId,
    reportType,
    periodKey,
  );

  return requireExistingReport(report, periodKey);
}
