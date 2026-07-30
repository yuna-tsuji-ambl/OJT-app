import type { ReportResponse } from '../domain/reportForm';
import { ReportCardList } from './ReportCardList';

interface PastReportListProps {
  sectionLabel: string;
  reports: readonly ReportResponse[];
  getDetailPath?: (report: ReportResponse) => string;
}

/** セクション付き報告一覧シェル */
export function PastReportList({
  sectionLabel,
  reports,
  getDetailPath,
}: PastReportListProps) {
  if (reports.length === 0) {
    return null;
  }

  return (
    <section aria-label={sectionLabel}>
      <ReportCardList reports={reports} getDetailPath={getDetailPath} />
    </section>
  );
}
