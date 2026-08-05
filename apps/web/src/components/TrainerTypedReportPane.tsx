import {
  DAILY_REPORT_PAGE_TITLE,
  PAST_DAILY_REPORTS_SECTION_LABEL,
  PAST_WEEKLY_REPORTS_SECTION_LABEL,
  REPORT_TYPE_DAILY,
  WEEKLY_REPORT_PAGE_TITLE,
  type ReportFormType,
} from '../domain/reportForm';
import { useTrainerTypedReports } from '../hooks/useTrainerReports';
import { ReportListFilter } from './ReportListFilter';
import { TrainerReportList } from './TrainerReportList';

interface TrainerTypedReportPaneProps {
  readonly reportType: ReportFormType;
}

/** トレーナー報告書の種別固定ペイン（フィルタ＋一覧） */
export function TrainerTypedReportPane({
  reportType,
}: TrainerTypedReportPaneProps) {
  const isDaily = reportType === REPORT_TYPE_DAILY;
  const heading = isDaily ? DAILY_REPORT_PAGE_TITLE : WEEKLY_REPORT_PAGE_TITLE;
  const emptyLabel = isDaily
    ? PAST_DAILY_REPORTS_SECTION_LABEL
    : PAST_WEEKLY_REPORTS_SECTION_LABEL;

  const { reports, filterError, applyFilter } =
    useTrainerTypedReports(reportType);

  return (
    <section
      className="trainer-report-pane"
      aria-labelledby={`trainer-report-${reportType}-heading`}
    >
      <h2 id={`trainer-report-${reportType}-heading`}>{heading}</h2>
      <ReportListFilter
        dateFieldLabel={isDaily ? '特定日' : '特定日または週キー'}
        dateInputType={isDaily ? 'date' : 'text'}
        onApply={(query) => void applyFilter(query)}
      />
      {filterError ? <div role="alert">{filterError}</div> : null}
      <TrainerReportList reports={reports} sectionLabel={heading} />
      {reports.length === 0 && !filterError ? (
        <p>{emptyLabel}はありません</p>
      ) : null}
    </section>
  );
}
