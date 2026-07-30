import { ensureTrainee } from '../domain/authorization.js';
import type { UserContext } from '../domain/types.js';
import type { ReportRepository } from '../repositories/reportRepository.js';
import type { ReportType } from './reportConstants.js';
import { requireOwnedReport } from './reportQueries.js';
import { validateOwnedReportPeriodKey } from './reportPeriodKeyValidation.js';
import type { OwnedReportByType, PutReportInputByType } from './reportTypes.js';
import { upsertOwnedReport } from './upsertOwnedReport.js';
import { validateOwnedReportPutInput } from './reportValidation.js';

function ensureOwnedReportPreconditions(
  context: UserContext,
  reportType: ReportType,
  periodKey: string,
): void {
  ensureTrainee(context);
  validateOwnedReportPeriodKey(reportType, periodKey);
}

export async function getOwnedReportCommand<TType extends ReportType>(
  reportType: TType,
  periodKey: string,
  context: UserContext,
  reportRepository: ReportRepository,
): Promise<OwnedReportByType[TType]> {
  ensureOwnedReportPreconditions(context, reportType, periodKey);

  return requireOwnedReport(
    reportRepository,
    context.userId,
    reportType,
    periodKey,
  );
}

export async function putOwnedReportCommand<TType extends ReportType>(
  reportType: TType,
  periodKey: string,
  input: PutReportInputByType[TType],
  context: UserContext,
  reportRepository: ReportRepository,
): Promise<OwnedReportByType[TType]> {
  ensureOwnedReportPreconditions(context, reportType, periodKey);
  validateOwnedReportPutInput(reportType, input);

  return upsertOwnedReport(
    reportRepository,
    context.userId,
    periodKey,
    reportType,
    input,
  );
}
