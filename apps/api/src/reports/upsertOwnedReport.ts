import type { ReportRepository } from '../repositories/reportRepository.js';
import type { ReportType } from './reportConstants.js';
import { buildReport } from './buildReport.js';
import { findOwnedReport } from './reportQueries.js';
import type { OwnedReportByType, PutReportInputByType } from './reportTypes.js';

export async function upsertOwnedReport<TType extends ReportType>(
  reportRepository: ReportRepository,
  traineeId: string,
  periodKey: string,
  reportType: TType,
  input: PutReportInputByType[TType],
): Promise<OwnedReportByType[TType]> {
  const existing = await findOwnedReport(
    reportRepository,
    traineeId,
    reportType,
    periodKey,
  );

  const report = buildReport({
    reportType,
    traineeId,
    periodKey,
    status: input.status,
    content: input.content,
    existing,
  });

  return reportRepository.save(report);
}
