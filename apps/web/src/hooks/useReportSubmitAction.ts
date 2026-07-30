import { useCallback } from 'react';
import {
  REPORT_STATUS_SUBMITTED,
  type ReportFormStatus,
} from '../domain/reportForm';

/** 所有報告フォームの提出アクション（status=submitted で persist） */
export function useReportSubmitAction(
  persist: (status: ReportFormStatus) => Promise<void>,
): () => Promise<void> {
  return useCallback(async (): Promise<void> => {
    await persist(REPORT_STATUS_SUBMITTED);
  }, [persist]);
}
