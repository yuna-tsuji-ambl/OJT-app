import {
  PAST_DAILY_REPORTS_SECTION_LABEL,
  type DailyReportResponse,
  type ReportResponse,
} from '../domain/reportForm';
import { PastReportList } from './PastReportList';

interface PastDailyReportListProps {
  reports: readonly DailyReportResponse[];
  /** 一覧カードの「編集」から日次報告を左フォームへ読み込む */
  onEdit?: (report: ReportResponse) => void;
}

/** 新卒向け過去日次報告一覧（UC-R03 / U-R32） */
export function PastDailyReportList({
  reports,
  onEdit,
}: PastDailyReportListProps) {
  return (
    <PastReportList
      sectionLabel={PAST_DAILY_REPORTS_SECTION_LABEL}
      reports={reports}
      onEdit={onEdit}
    />
  );
}
