import { fetchOwnDailyReports } from '../api/reportApi';
import { PastDailyReportList } from '../components/PastDailyReportList';
import { ReportListFilter } from '../components/ReportListFilter';
import { ReportPageShell } from '../components/ReportPageShell';
import { RequireTraineeRole } from '../components/RequireRole';
import {
  DAILY_REPORT_LIST_HEADING_ID,
  DAILY_REPORT_LIST_PAGE_TITLE,
  PAST_DAILY_REPORTS_SECTION_LABEL,
  type DailyReportResponse,
} from '../domain/reportForm';
import { useFilteredOwnReports } from '../hooks/useFilteredOwnReports';

const EMPTY_OWN_DAILY_REPORTS: readonly DailyReportResponse[] = [];

/** 新卒向け日次報告書一覧（UC-R03 / BR-R11） */
export function DailyReportListPage() {
  return (
    <RequireTraineeRole>
      <DailyReportListPageContent />
    </RequireTraineeRole>
  );
}

function DailyReportListPageContent() {
  const { reports, filterError, applyFilter } = useFilteredOwnReports({
    fetchReports: fetchOwnDailyReports,
    emptyReports: EMPTY_OWN_DAILY_REPORTS,
  });

  return (
    <ReportPageShell
      title={DAILY_REPORT_LIST_PAGE_TITLE}
      headingId={DAILY_REPORT_LIST_HEADING_ID}
    >
      <ReportListFilter onApply={(query) => void applyFilter(query)} />
      {filterError ? <div role="alert">{filterError}</div> : null}
      <PastDailyReportList reports={reports} />
      {reports.length === 0 && !filterError ? (
        <p>{PAST_DAILY_REPORTS_SECTION_LABEL}はありません</p>
      ) : null}
    </ReportPageShell>
  );
}
