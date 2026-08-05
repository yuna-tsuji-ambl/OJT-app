import { fetchDailyReport, putDailyReport } from '../api/reportApi';
import {
  createEmptyDailyReportFormValues,
  formatDailyReportPeriodKey,
  getDailyReportPersistSuccessMessage,
} from '../domain/reportForm';
import { useOwnedReportForm } from './useOwnedReportForm';

export function useDailyReportForm() {
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
    createEmptyValues: createEmptyDailyReportFormValues,
    formatPeriodKey: formatDailyReportPeriodKey,
    fetchReport: fetchDailyReport,
    putReport: putDailyReport,
    getPersistSuccessMessage: getDailyReportPersistSuccessMessage,
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
