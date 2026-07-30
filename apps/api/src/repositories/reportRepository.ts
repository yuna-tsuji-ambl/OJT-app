import type { OwnedReportByType, Report } from '../reports/reportTypes.js';
import type { ReportType } from '../reports/reportConstants.js';

export interface ReportRepository {
  findByTraineeTypeAndPeriodKey<TType extends ReportType>(
    traineeId: string,
    reportType: TType,
    periodKey: string,
  ): Promise<OwnedReportByType[TType] | null>;
  findByTraineeId(traineeId: string): Promise<Report[]>;
  findById(reportId: string): Promise<Report | null>;
  save<TType extends ReportType>(
    report: OwnedReportByType[TType],
  ): Promise<OwnedReportByType[TType]>;
}
