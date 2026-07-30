import { fetchWeeklyReport, putWeeklyReport } from '../api/reportApi';
import {
  createEmptyWeeklyReportFormValues,
  formatWeeklyReportPeriodKey,
  getWeeklyReportPersistSuccessMessage,
} from '../domain/reportForm';
import { useOwnedReportForm } from './useOwnedReportForm';
import { useReportSubmitAction } from './useReportSubmitAction';

export function useWeeklyReportForm() {
  const { values, updateField, persist, persistFeedback, isReady } =
    useOwnedReportForm({
      createEmptyValues: createEmptyWeeklyReportFormValues,
      formatPeriodKey: formatWeeklyReportPeriodKey,
      fetchReport: fetchWeeklyReport,
      putReport: putWeeklyReport,
      getPersistSuccessMessage: getWeeklyReportPersistSuccessMessage,
    });

  const submit = useReportSubmitAction(persist);

  return {
    values,
    updateField,
    submit,
    persistFeedback,
    isReady,
  };
}
