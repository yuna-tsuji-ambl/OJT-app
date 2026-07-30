import { DailyReportActions } from '../components/DailyReportActions';
import { PastDailyReportList } from '../components/PastDailyReportList';
import { ReportForm } from '../components/ReportForm';
import { RequireTraineeRole } from '../components/RequireRole';
import { TraineeOwnedReportPageLayout } from '../components/TraineeOwnedReportPageLayout';
import {
  DAILY_REPORT_HEADING_ID,
  DAILY_REPORT_PAGE_TITLE,
  REPORT_TYPE_DAILY,
} from '../domain/reportForm';
import { useDailyReportForm } from '../hooks/useDailyReportForm';
import { useOwnDailyReports } from '../hooks/useOwnDailyReports';

/** 新卒向け日次報告画面（§6.1 / U-R38） */
export function DailyReportPage() {
  return (
    <RequireTraineeRole>
      <DailyReportPageContent />
    </RequireTraineeRole>
  );
}

function DailyReportPageContent() {
  const { values, updateField, saveDraft, submit, persistFeedback, isReady } =
    useDailyReportForm();
  const { reports } = useOwnDailyReports();

  return (
    <TraineeOwnedReportPageLayout
      title={DAILY_REPORT_PAGE_TITLE}
      headingId={DAILY_REPORT_HEADING_ID}
      persistFeedback={persistFeedback}
      form={
        <ReportForm
          reportType={REPORT_TYPE_DAILY}
          values={values}
          onChange={updateField}
          disabled={!isReady}
        />
      }
      actions={<DailyReportActions onSaveDraft={saveDraft} onSubmit={submit} />}
      pastList={<PastDailyReportList reports={reports} />}
    />
  );
}
