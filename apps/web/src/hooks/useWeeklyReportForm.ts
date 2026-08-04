import { fetchWeeklyReport, putWeeklyReport } from '../api/reportApi';
import {
  createEmptyWeeklyReportFormValues,
  formatWeeklyReportPeriodKey,
  getWeeklyReportPersistSuccessMessage,
} from '../domain/reportForm';
import { useOwnedReportForm } from './useOwnedReportForm';

export function useWeeklyReportForm() {
  const {
    values,
    updateField,
    persist,
    persistFeedback,
    isReady,
    periodKey,
    isEditingPast,
    loadReportForEdit,
    resetToCurrentPeriod,
  } = useOwnedReportForm({
    createEmptyValues: createEmptyWeeklyReportFormValues,
    formatPeriodKey: formatWeeklyReportPeriodKey,
    fetchReport: fetchWeeklyReport,
    putReport: putWeeklyReport,
    getPersistSuccessMessage: getWeeklyReportPersistSuccessMessage,
  });

  return {
    values,
    updateField,
    submit: persist,
    persistFeedback,
    isReady,
    periodKey,
    isEditingPast,
    loadReportForEdit,
    resetToCurrentPeriod,
  };
}
