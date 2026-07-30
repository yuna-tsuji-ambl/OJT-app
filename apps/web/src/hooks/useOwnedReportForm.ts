import { useCallback, useMemo, useState } from 'react';
import type { AuthUser } from '../auth/types';
import { useAuth } from '../auth/AuthContext';
import {
  getOwnedReportPersistErrorMessage,
  type PutReportFormInput,
  type ReportFormStatus,
  type ReportPersistFeedback,
} from '../domain/reportForm';
import {
  useOwnedReportLoader,
  type OwnedReportWithContent,
} from './useOwnedReportLoader';
import { useReportFormValues } from './useReportFormValues';

interface UseOwnedReportFormOptions<TContent extends Record<string, string>> {
  createEmptyValues: () => TContent;
  formatPeriodKey: (date: Date) => string;
  fetchReport: (
    periodKey: string,
    user: AuthUser,
  ) => Promise<OwnedReportWithContent<TContent> | null>;
  putReport: (
    periodKey: string,
    input: PutReportFormInput<TContent>,
    user: AuthUser,
  ) => Promise<OwnedReportWithContent<TContent>>;
  getPersistSuccessMessage: (status: ReportFormStatus) => string;
}

/**
 * 所有報告フォームの共通ロジック（periodKey 生成・復元・永続化・フィードバック）。
 */
export function useOwnedReportForm<TContent extends Record<string, string>>({
  createEmptyValues,
  formatPeriodKey,
  fetchReport,
  putReport,
  getPersistSuccessMessage,
}: UseOwnedReportFormOptions<TContent>) {
  const { user } = useAuth();
  const { values, updateField, replaceValues } =
    useReportFormValues(createEmptyValues);
  const [persistFeedback, setPersistFeedback] =
    useState<ReportPersistFeedback>(null);
  const periodKey = useMemo(
    () => formatPeriodKey(new Date()),
    [formatPeriodKey],
  );

  const { isReady } = useOwnedReportLoader(
    periodKey,
    fetchReport,
    replaceValues,
  );

  const persist = useCallback(
    async (status: ReportFormStatus): Promise<void> => {
      if (!user || !isReady) {
        return;
      }

      try {
        await putReport(
          periodKey,
          {
            status,
            content: values,
          },
          user,
        );
        setPersistFeedback({
          type: 'success',
          message: getPersistSuccessMessage(status),
        });
      } catch {
        setPersistFeedback({
          type: 'error',
          message: getOwnedReportPersistErrorMessage(status, values),
        });
      }
    },
    [getPersistSuccessMessage, isReady, periodKey, putReport, user, values],
  );

  return {
    values,
    updateField,
    persist,
    persistFeedback,
    isReady,
  };
}
