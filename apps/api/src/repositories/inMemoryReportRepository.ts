import type { ReportType } from '../reports/reportConstants.js';
import { buildReportUniquenessKey } from '../reports/reportUniquenessKey.js';
import type { OwnedReportByType, Report } from '../reports/reportTypes.js';
import type { ReportRepository } from './reportRepository.js';

function cloneReport<TReport extends Report>(report: TReport): TReport {
  return structuredClone(report);
}

export class InMemoryReportRepository implements ReportRepository {
  private readonly reportsById = new Map<string, Report>();
  private readonly reportIdByUniquenessKey = new Map<string, string>();

  async findByTraineeTypeAndPeriodKey<TType extends ReportType>(
    traineeId: string,
    reportType: TType,
    periodKey: string,
  ): Promise<OwnedReportByType[TType] | null> {
    const uniquenessKey = buildReportUniquenessKey({
      traineeId,
      type: reportType,
      periodKey,
    });
    const reportId = this.reportIdByUniquenessKey.get(uniquenessKey);

    if (!reportId) {
      return null;
    }

    const report = this.reportsById.get(reportId);
    return report ? (cloneReport(report) as OwnedReportByType[TType]) : null;
  }

  async findByTraineeId(traineeId: string): Promise<Report[]> {
    return [...this.reportsById.values()]
      .filter((report) => report.traineeId === traineeId)
      .map((report) => cloneReport(report));
  }

  async findById(reportId: string): Promise<Report | null> {
    const report = this.reportsById.get(reportId);
    return report ? cloneReport(report) : null;
  }

  async save<TType extends ReportType>(
    report: OwnedReportByType[TType],
  ): Promise<OwnedReportByType[TType]> {
    const previous = this.reportsById.get(report.id);

    if (previous) {
      this.reportIdByUniquenessKey.delete(
        buildReportUniquenessKey({
          traineeId: previous.traineeId,
          type: previous.type,
          periodKey: previous.periodKey,
        }),
      );
    }

    const stored = cloneReport(report);
    this.reportsById.set(stored.id, stored);
    this.reportIdByUniquenessKey.set(
      buildReportUniquenessKey({
        traineeId: stored.traineeId,
        type: stored.type,
        periodKey: stored.periodKey,
      }),
      stored.id,
    );

    return cloneReport(stored);
  }
}
