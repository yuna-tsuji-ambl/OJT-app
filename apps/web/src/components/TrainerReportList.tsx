import {
  buildReportDetailPath,
  REPORT_LIST_PAGE_TITLE,
  type ReportResponse,
} from '../domain/reportForm';
import { PastReportList } from './PastReportList';

interface TrainerReportListProps {
  reports: readonly ReportResponse[];
}

function getTrainerReportDetailPath(report: ReportResponse): string {
  return buildReportDetailPath(report.id);
}

/** トレーナー向け担当新卒の報告一覧（UC-R04 / U-R35 / U-R36） */
export function TrainerReportList({ reports }: TrainerReportListProps) {
  return (
    <PastReportList
      sectionLabel={REPORT_LIST_PAGE_TITLE}
      reports={reports}
      getDetailPath={getTrainerReportDetailPath}
    />
  );
}
