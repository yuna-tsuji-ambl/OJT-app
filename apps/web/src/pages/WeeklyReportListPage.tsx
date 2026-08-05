import { fetchOwnWeeklyReports } from '../api/reportApi';
import { PastWeeklyReportList } from '../components/PastWeeklyReportList';
import { ReportListFilter } from '../components/ReportListFilter';
import { ReportPageShell } from '../components/ReportPageShell';
import { RequireTraineeRole } from '../components/RequireRole';
import {
  PAST_WEEKLY_REPORTS_SECTION_LABEL,
  WEEKLY_REPORT_LIST_HEADING_ID,
  WEEKLY_REPORT_LIST_PAGE_TITLE,
  type WeeklyReportResponse,
} from '../domain/reportForm';
import { useFilteredOwnReports } from '../hooks/useFilteredOwnReports';

const EMPTY_OWN_WEEKLY_REPORTS: readonly WeeklyReportResponse[] = [];

/** 新卒向け週次報告書一覧（UC-R03 / BR-R11） */
export function WeeklyReportListPage() {
  return (
    <RequireTraineeRole>
      <WeeklyReportListPageContent />
    </RequireTraineeRole>
  );
}

function WeeklyReportListPageContent() {
  const { reports, filterError, applyFilter } = useFilteredOwnReports({
    fetchReports: fetchOwnWeeklyReports,
    emptyReports: EMPTY_OWN_WEEKLY_REPORTS,
  });

  return (
    <ReportPageShell
      title={WEEKLY_REPORT_LIST_PAGE_TITLE}
      headingId={WEEKLY_REPORT_LIST_HEADING_ID}
    >
      <ReportListFilter
        dateFieldLabel="特定日または週キー"
        dateInputType="text"
        onApply={(query) => void applyFilter(query)}
      />
      {filterError ? <div role="alert">{filterError}</div> : null}
      <PastWeeklyReportList reports={reports} />
      {reports.length === 0 && !filterError ? (
        <p>{PAST_WEEKLY_REPORTS_SECTION_LABEL}はありません</p>
      ) : null}
    </ReportPageShell>
  );
}
