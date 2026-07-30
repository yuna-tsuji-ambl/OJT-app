import { Link } from 'react-router-dom';
import { DailyReportActions } from '../components/DailyReportActions';
import { ReportForm } from '../components/ReportForm';
import { ReportPersistFeedbackView } from '../components/ReportPersistFeedback';
import { ReportSubmitButton } from '../components/ReportSubmitButton';
import { RequireTraineeRole } from '../components/RequireRole';
import {
  DAILY_REPORT_HEADING_ID,
  DAILY_REPORT_LIST_LINK_LABEL,
  DAILY_REPORT_LIST_PATH,
  DAILY_REPORT_PAGE_TITLE,
  REPORT_TYPE_DAILY,
  REPORT_TYPE_WEEKLY,
  WEEKLY_REPORT_HEADING_ID,
  WEEKLY_REPORT_LIST_LINK_LABEL,
  WEEKLY_REPORT_LIST_PATH,
  WEEKLY_REPORT_PAGE_TITLE,
} from '../domain/reportForm';
import { useDailyReportForm } from '../hooks/useDailyReportForm';
import { useWeeklyReportForm } from '../hooks/useWeeklyReportForm';

/** 新卒向け報告書入力画面（日次・週次を同一ページに配置 / BR-R07, BR-R09） */
export function TraineeReportPage() {
  return (
    <RequireTraineeRole>
      <TraineeReportPageContent />
    </RequireTraineeRole>
  );
}

function TraineeReportPageContent() {
  const dailyForm = useDailyReportForm();
  const weeklyForm = useWeeklyReportForm();

  return (
    <section className="page-section" aria-labelledby="trainee-reports-heading">
      <h1 id="trainee-reports-heading">報告書</h1>

      <section aria-labelledby={DAILY_REPORT_HEADING_ID}>
        <h2 id={DAILY_REPORT_HEADING_ID}>{DAILY_REPORT_PAGE_TITLE}</h2>
        <ReportForm
          reportType={REPORT_TYPE_DAILY}
          values={dailyForm.values}
          onChange={dailyForm.updateField}
          disabled={!dailyForm.isReady}
        />
        <ReportPersistFeedbackView feedback={dailyForm.persistFeedback} />
        <DailyReportActions
          onSaveDraft={dailyForm.saveDraft}
          onSubmit={dailyForm.submit}
        />
        <p>
          <Link to={DAILY_REPORT_LIST_PATH}>
            {DAILY_REPORT_LIST_LINK_LABEL}
          </Link>
        </p>
      </section>

      <section aria-labelledby={WEEKLY_REPORT_HEADING_ID}>
        <h2 id={WEEKLY_REPORT_HEADING_ID}>{WEEKLY_REPORT_PAGE_TITLE}</h2>
        <ReportForm
          reportType={REPORT_TYPE_WEEKLY}
          values={weeklyForm.values}
          onChange={weeklyForm.updateField}
          disabled={!weeklyForm.isReady}
        />
        <ReportPersistFeedbackView feedback={weeklyForm.persistFeedback} />
        <ReportSubmitButton onSubmit={weeklyForm.submit} />
        <p>
          <Link to={WEEKLY_REPORT_LIST_PATH}>
            {WEEKLY_REPORT_LIST_LINK_LABEL}
          </Link>
        </p>
      </section>
    </section>
  );
}
