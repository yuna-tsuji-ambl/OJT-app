import { useState } from 'react';
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
  DAILY_REPORT_RESET_TO_CURRENT_BUTTON_LABEL,
  getDailyReportEditingBannerMessage,
  getWeeklyReportEditingBannerMessage,
  REPORT_TYPE_DAILY,
  REPORT_TYPE_WEEKLY,
  WEEKLY_REPORT_HEADING_ID,
  WEEKLY_REPORT_PAGE_TITLE,
  WEEKLY_REPORT_RESET_TO_CURRENT_BUTTON_LABEL,
  type DailyReportFormValues,
  type ReportFormType,
  type ReportResponse,
  type WeeklyReportFormValues,
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
  const [listRefreshKey, setListRefreshKey] = useState(0);
  const dailyForm = useDailyReportForm();
  const weeklyForm = useWeeklyReportForm();
  const isDaily = reportType === REPORT_TYPE_DAILY;

  /** 一覧カードの「編集」で当該報告を左フォームへ読み込み、種別トグルも同期する */
  const handleEditReport = (report: ReportResponse): void => {
    if (report.type === REPORT_TYPE_DAILY) {
      dailyForm.loadReportForEdit(
        report.periodKey,
        report.content as DailyReportFormValues,
      );
      setReportType(REPORT_TYPE_DAILY);
    } else {
      weeklyForm.loadReportForEdit(
        report.periodKey,
        report.content as WeeklyReportFormValues,
      );
      setReportType(REPORT_TYPE_WEEKLY);
    }
  };

  /** 提出成功時は一覧を再読み込みする（編集内容の反映） */
  const handleDailySubmit = async (): Promise<void> => {
    const succeeded = await dailyForm.submit();
    if (succeeded) {
      setListRefreshKey((key) => key + 1);
    }
  };

  const handleWeeklySubmit = async (): Promise<void> => {
    const succeeded = await weeklyForm.submit();
    if (succeeded) {
      setListRefreshKey((key) => key + 1);
    }
  };

  return (
    <section
      className="page-section page-section--wide"
      aria-labelledby="trainee-reports-heading"
    >
      <div className="page-section__title-row">
        <h1 id="trainee-reports-heading">報告書</h1>
        <div className="page-section__title-meta">
          <ReportTypeToggle value={reportType} onChange={setReportType} />
        </div>
      </div>

      <ReportSplitView
        left={
          isDaily ? (
            <section aria-labelledby={DAILY_REPORT_HEADING_ID}>
              <h2 id={DAILY_REPORT_HEADING_ID}>{DAILY_REPORT_PAGE_TITLE}</h2>
              {dailyForm.isEditingPast ? (
                <div className="report-edit-banner" role="status">
                  <span>
                    {getDailyReportEditingBannerMessage(dailyForm.periodKey)}
                  </span>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={dailyForm.resetToCurrentPeriod}
                  >
                    {DAILY_REPORT_RESET_TO_CURRENT_BUTTON_LABEL}
                  </button>
                </div>
              ) : null}
              <ReportForm
                reportType={REPORT_TYPE_DAILY}
                values={dailyForm.values}
                onChange={dailyForm.updateField}
                disabled={!dailyForm.isReady}
              />
              <ReportPersistFeedbackView feedback={dailyForm.persistFeedback} />
              <ReportSubmitButton onSubmit={handleDailySubmit} />
            </section>
          ) : (
            <section aria-labelledby={WEEKLY_REPORT_HEADING_ID}>
              <h2 id={WEEKLY_REPORT_HEADING_ID}>{WEEKLY_REPORT_PAGE_TITLE}</h2>
              {weeklyForm.isEditingPast ? (
                <div className="report-edit-banner" role="status">
                  <span>
                    {getWeeklyReportEditingBannerMessage(weeklyForm.periodKey)}
                  </span>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={weeklyForm.resetToCurrentPeriod}
                  >
                    {WEEKLY_REPORT_RESET_TO_CURRENT_BUTTON_LABEL}
                  </button>
                </div>
              ) : null}
              <ReportForm
                reportType={REPORT_TYPE_WEEKLY}
                values={weeklyForm.values}
                onChange={weeklyForm.updateField}
                disabled={!weeklyForm.isReady}
              />
              <ReportPersistFeedbackView
                feedback={weeklyForm.persistFeedback}
              />
              <ReportSubmitButton onSubmit={handleWeeklySubmit} />
            </section>
          )
        }
        right={
          <TraineeOwnReportListPane
            key={listRefreshKey}
            reportType={reportType}
            onEditReport={handleEditReport}
          />
        }
      />
    </section>
  );
}
