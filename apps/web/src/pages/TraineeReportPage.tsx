import { useState } from 'react';
import { DailyReportActions } from '../components/DailyReportActions';
import { ReportForm } from '../components/ReportForm';
import { ReportPersistFeedbackView } from '../components/ReportPersistFeedback';
import { ReportSplitView } from '../components/ReportSplitView';
import { ReportSubmitButton } from '../components/ReportSubmitButton';
import { ReportTypeToggle } from '../components/ReportTypeToggle';
import { RequireTraineeRole } from '../components/RequireRole';
import { TraineeOwnReportListPane } from '../components/TraineeOwnReportListPane';
import {
  DAILY_REPORT_HEADING_ID,
  DAILY_REPORT_PAGE_TITLE,
  REPORT_TYPE_DAILY,
  REPORT_TYPE_WEEKLY,
  WEEKLY_REPORT_HEADING_ID,
  WEEKLY_REPORT_PAGE_TITLE,
  type ReportFormType,
} from '../domain/reportForm';
import { useDailyReportForm } from '../hooks/useDailyReportForm';
import { useWeeklyReportForm } from '../hooks/useWeeklyReportForm';

/** 新卒向け報告書画面（日次/週次トグル＋左右レイアウト / BR-R07, BR-R09） */
export function TraineeReportPage() {
  return (
    <RequireTraineeRole>
      <TraineeReportPageContent />
    </RequireTraineeRole>
  );
}

function TraineeReportPageContent() {
  const [reportType, setReportType] =
    useState<ReportFormType>(REPORT_TYPE_DAILY);
  const dailyForm = useDailyReportForm();
  const weeklyForm = useWeeklyReportForm();
  const isDaily = reportType === REPORT_TYPE_DAILY;

  return (
    <section
      className="page-section page-section--wide"
      aria-labelledby="trainee-reports-heading"
    >
      <h1 id="trainee-reports-heading">報告書</h1>

      <ReportTypeToggle value={reportType} onChange={setReportType} />

      <ReportSplitView
        left={
          isDaily ? (
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
            </section>
          ) : (
            <section aria-labelledby={WEEKLY_REPORT_HEADING_ID}>
              <h2 id={WEEKLY_REPORT_HEADING_ID}>{WEEKLY_REPORT_PAGE_TITLE}</h2>
              <ReportForm
                reportType={REPORT_TYPE_WEEKLY}
                values={weeklyForm.values}
                onChange={weeklyForm.updateField}
                disabled={!weeklyForm.isReady}
              />
              <ReportPersistFeedbackView
                feedback={weeklyForm.persistFeedback}
              />
              <ReportSubmitButton onSubmit={weeklyForm.submit} />
            </section>
          )
        }
        right={<TraineeOwnReportListPane reportType={reportType} />}
      />
    </section>
  );
}
