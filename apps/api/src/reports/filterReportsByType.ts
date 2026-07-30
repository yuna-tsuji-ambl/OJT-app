import type { ReportType } from './reportConstants.js';
import type { Report } from './reportTypes.js';

export function filterReportsByType(
  reports: readonly Report[],
  reportType: ReportType | undefined,
): Report[] {
  if (reportType === undefined) {
    return [...reports];
  }

  return reports.filter((report) => report.type === reportType);
}
