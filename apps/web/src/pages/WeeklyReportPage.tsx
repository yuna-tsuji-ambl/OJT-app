import { PastWeeklyReportList } from '../components/PastWeeklyReportList';
import { ReportForm } from '../components/ReportForm';
import { ReportSubmitButton } from '../components/ReportSubmitButton';
import { RequireTraineeRole } from '../components/RequireRole';
import { TraineeOwnedReportPageLayout } from '../components/TraineeOwnedReportPageLayout';
import {
  REPORT_TYPE_WEEKLY,
  WEEKLY_REPORT_HEADING_ID,
  WEEKLY_REPORT_PAGE_TITLE,
} from '../domain/reportForm';
import { useOwnWeeklyReports } from '../hooks/useOwnWeeklyReports';
import { useWeeklyReportForm } from '../hooks/useWeeklyReportForm';

/** 新卒向け週次報告画面（§6.1 / U-R38） */
export function WeeklyReportPage() {
  return (
    <RequireTraineeRole>
      <WeeklyReportPageContent />
    </RequireTraineeRole>
  );
}

function WeeklyReportPageContent() {
  const { values, updateField, submit, persistFeedback, isReady } =
    useWeeklyReportForm();
  const { reports } = useOwnWeeklyReports();

  return (
    <TraineeOwnedReportPageLayout
      title={WEEKLY_REPORT_PAGE_TITLE}
      headingId={WEEKLY_REPORT_HEADING_ID}
      persistFeedback={persistFeedback}
      form={
        <ReportForm
          reportType={REPORT_TYPE_WEEKLY}
          values={values}
          onChange={updateField}
          disabled={!isReady}
        />
      }
      actions={<ReportSubmitButton onSubmit={submit} />}
      pastList={<PastWeeklyReportList reports={reports} />}
    />
  );
}
