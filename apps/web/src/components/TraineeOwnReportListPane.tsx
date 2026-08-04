import { fetchOwnDailyReports, fetchOwnWeeklyReports } from '../api/reportApi';
import {
  PAST_DAILY_REPORTS_SECTION_LABEL,
  PAST_WEEKLY_REPORTS_SECTION_LABEL,
  REPORT_TYPE_DAILY,
  type DailyReportResponse,
  type ReportFormType,
  type ReportResponse,
  type WeeklyReportResponse,
} from '../domain/reportForm';
import { useFilteredOwnReports } from '../hooks/useFilteredOwnReports';
import { PastDailyReportList } from './PastDailyReportList';
import { PastWeeklyReportList } from './PastWeeklyReportList';
import { ReportListFilter } from './ReportListFilter';

const EMPTY_OWN_DAILY_REPORTS: readonly DailyReportResponse[] = [];
const EMPTY_OWN_WEEKLY_REPORTS: readonly WeeklyReportResponse[] = [];

interface TraineeOwnReportListPaneProps {
  readonly reportType: ReportFormType;
  /** 一覧カードの「編集」から当該報告を左フォームへ読み込む */
  readonly onEditReport?: (report: ReportResponse) => void;
}

/** `/reports` 右ペイン: 選択種別のフィルタ＋過去一覧（UC-R03） */
export function TraineeOwnReportListPane({
  reportType,
  onEditReport,
}: TraineeOwnReportListPaneProps) {
  if (reportType === REPORT_TYPE_DAILY) {
    return <OwnDailyReportListPane onEditReport={onEditReport} />;
  }

  return <OwnWeeklyReportListPane onEditReport={onEditReport} />;
}

interface OwnReportListPaneProps {
  readonly onEditReport?: (report: ReportResponse) => void;
}

function OwnDailyReportListPane({ onEditReport }: OwnReportListPaneProps) {
  const { reports, filterError, applyFilter } = useFilteredOwnReports({
    fetchReports: fetchOwnDailyReports,
    emptyReports: EMPTY_OWN_DAILY_REPORTS,
  });

  return (
    <>
      <ReportListFilter onApply={(query) => void applyFilter(query)} />
      {filterError ? <div role="alert">{filterError}</div> : null}
      <PastDailyReportList reports={reports} onEdit={onEditReport} />
      {reports.length === 0 && !filterError ? (
        <p>{PAST_DAILY_REPORTS_SECTION_LABEL}はありません</p>
      ) : null}
    </>
  );
}

function OwnWeeklyReportListPane({ onEditReport }: OwnReportListPaneProps) {
  const { reports, filterError, applyFilter } = useFilteredOwnReports({
    fetchReports: fetchOwnWeeklyReports,
    emptyReports: EMPTY_OWN_WEEKLY_REPORTS,
  });

  return (
    <>
      <ReportListFilter
        dateFieldLabel="特定日または週キー"
        dateInputType="text"
        onApply={(query) => void applyFilter(query)}
      />
      {filterError ? <div role="alert">{filterError}</div> : null}
      <PastWeeklyReportList reports={reports} onEdit={onEditReport} />
      {reports.length === 0 && !filterError ? (
        <p>{PAST_WEEKLY_REPORTS_SECTION_LABEL}はありません</p>
      ) : null}
    </>
  );
}
