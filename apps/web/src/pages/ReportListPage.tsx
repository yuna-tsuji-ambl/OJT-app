import { ReportPageShell } from '../components/ReportPageShell';
import { ReportTypeFilter } from '../components/ReportTypeFilter';
import { RequireTrainerRole } from '../components/RequireRole';
import { TrainerReportList } from '../components/TrainerReportList';
import {
  REPORT_LIST_HEADING_ID,
  REPORT_LIST_PAGE_TITLE,
} from '../domain/reportForm';
import { useTrainerReports } from '../hooks/useTrainerReports';

/** トレーナー向け担当新卒の報告書一覧（§6.1 / U-R34 / U-R35 / U-R37 / E-R10） */
export function ReportListPage() {
  return (
    <RequireTrainerRole>
      <TrainerReportListContent />
    </RequireTrainerRole>
  );
}

/** トレーナー認可後の一覧本体（データ取得はここでのみ行う） */
function TrainerReportListContent() {
  const { reports, reportTypeFilter, setReportTypeFilter } =
    useTrainerReports();

  return (
    <ReportPageShell
      title={REPORT_LIST_PAGE_TITLE}
      headingId={REPORT_LIST_HEADING_ID}
    >
      <ReportTypeFilter
        value={reportTypeFilter}
        onChange={setReportTypeFilter}
      />
      <TrainerReportList reports={reports} />
    </ReportPageShell>
  );
}
