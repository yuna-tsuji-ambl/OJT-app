import { useCallback } from 'react';
import { fetchDailyReport, putDailyReport } from '../api/reportApi';
import {
  createEmptyDailyReportFormValues,
  formatDailyReportPeriodKey,
  getDailyReportPersistSuccessMessage,
  REPORT_STATUS_DRAFT,
} from '../domain/reportForm';
import { useOwnedReportForm } from './useOwnedReportForm';
import { useReportSubmitAction } from './useReportSubmitAction';

export function useDailyReportForm() {
  const { values, updateField, persist, persistFeedback, isReady } =
    useOwnedReportForm({
      createEmptyValues: createEmptyDailyReportFormValues,
      formatPeriodKey: formatDailyReportPeriodKey,
      fetchReport: fetchDailyReport,
      putReport: putDailyReport,
      getPersistSuccessMessage: getDailyReportPersistSuccessMessage,
    });

  const saveDraft = useCallback(async (): Promise<void> => {
    await persist(REPORT_STATUS_DRAFT);
  }, [persist]);

  const submit = useReportSubmitAction(persist);

  return {
    values,
    updateField,
    saveDraft,
    submit,
    persistFeedback,
    isReady,
  };
}
