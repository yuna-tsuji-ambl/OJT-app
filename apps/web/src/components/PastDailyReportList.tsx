import {
  PAST_DAILY_REPORTS_SECTION_LABEL,
  type DailyReportResponse,
} from '../domain/reportForm';
import { PastReportList } from './PastReportList';

interface PastDailyReportListProps {
  reports: readonly DailyReportResponse[];
}

/** 新卒向け過去日次報告一覧（UC-R03 / U-R32） */
export function PastDailyReportList({ reports }: PastDailyReportListProps) {
  return (
    <PastReportList
      sectionLabel={PAST_DAILY_REPORTS_SECTION_LABEL}
      reports={reports}
    />
  );
}
