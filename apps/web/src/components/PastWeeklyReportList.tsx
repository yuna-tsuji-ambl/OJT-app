import {
  PAST_WEEKLY_REPORTS_SECTION_LABEL,
  type WeeklyReportResponse,
} from '../domain/reportForm';
import { PastReportList } from './PastReportList';

interface PastWeeklyReportListProps {
  reports: readonly WeeklyReportResponse[];
}

/** 新卒向け過去週次報告一覧（UC-R03 / U-R33） */
export function PastWeeklyReportList({ reports }: PastWeeklyReportListProps) {
  return (
    <PastReportList
      sectionLabel={PAST_WEEKLY_REPORTS_SECTION_LABEL}
      reports={reports}
    />
  );
}
