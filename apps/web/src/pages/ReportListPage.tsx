import { ReportSplitView } from '../components/ReportSplitView';
import { RequireTrainerRole } from '../components/RequireRole';
import { TrainerTypedReportPane } from '../components/TrainerTypedReportPane';
import {
  REPORT_LIST_HEADING_ID,
  REPORT_LIST_PAGE_TITLE,
  REPORT_TYPE_DAILY,
  REPORT_TYPE_WEEKLY,
} from '../domain/reportForm';

/** トレーナー向け担当新卒の報告書一覧（左=日次 / 右=週次 + 検索） */
export function ReportListPage() {
  return (
    <RequireTrainerRole>
      <TrainerReportListContent />
    </RequireTrainerRole>
  );
}

function TrainerReportListContent() {
  return (
    <section
      className="page-section page-section--wide"
      aria-labelledby={REPORT_LIST_HEADING_ID}
    >
      <h1 id={REPORT_LIST_HEADING_ID}>{REPORT_LIST_PAGE_TITLE}</h1>
      <ReportSplitView
        left={<TrainerTypedReportPane reportType={REPORT_TYPE_DAILY} />}
        right={<TrainerTypedReportPane reportType={REPORT_TYPE_WEEKLY} />}
      />
    </section>
  );
}
