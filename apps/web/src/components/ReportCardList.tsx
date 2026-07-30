import type { ReportResponse } from '../domain/reportForm';
import { ReportCard } from './ReportCard';

interface ReportCardListProps {
  reports: readonly ReportResponse[];
  getDetailPath?: (report: ReportResponse) => string;
}

/** ReportCard の並び描画（表示順は呼び出し側が決定する） */
export function ReportCardList({
  reports,
  getDetailPath,
}: ReportCardListProps) {
  return (
    <>
      {reports.map((report) => (
        <ReportCard
          key={report.id}
          report={report}
          detailTo={getDetailPath?.(report)}
        />
      ))}
    </>
  );
}
