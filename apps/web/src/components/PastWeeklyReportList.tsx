import {
  PAST_WEEKLY_REPORTS_SECTION_LABEL,
  type ReportResponse,
  type WeeklyReportResponse,
} from '../domain/reportForm';
import { PastReportList } from './PastReportList';

interface PastWeeklyReportListProps {
  reports: readonly WeeklyReportResponse[];
  /** 一覧カードの「編集」から週次報告を左フォームへ読み込む */
  onEdit?: (report: ReportResponse) => void;
}

/** 新卒向け過去週次報告一覧（UC-R03 / U-R33） */
export function PastWeeklyReportList({
  reports,
  onEdit,
}: PastWeeklyReportListProps) {
  return (
    <PastReportList
      sectionLabel={PAST_WEEKLY_REPORTS_SECTION_LABEL}
      reports={reports}
      onEdit={onEdit}
    />
  );
}
