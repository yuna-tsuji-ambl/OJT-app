import {
  buildReportDetailPath,
  REPORT_LIST_PAGE_TITLE,
  type ReportResponse,
} from '../domain/reportForm';
import { PastReportList } from './PastReportList';

interface TrainerReportListProps {
  reports: readonly ReportResponse[];
  /** ペイン見出し（未指定時は報告書一覧） */
  sectionLabel?: string;
}

function getTrainerReportDetailPath(report: ReportResponse): string {
  return buildReportDetailPath(report.id);
}

/** トレーナー向け担当新卒の報告一覧（UC-R04 / U-R35 / U-R36） */
export function TrainerReportList({
  reports,
  sectionLabel = REPORT_LIST_PAGE_TITLE,
}: TrainerReportListProps) {
  return (
    <PastReportList
      sectionLabel={sectionLabel}
      reports={reports}
      getDetailPath={getTrainerReportDetailPath}
    />
  );
}
