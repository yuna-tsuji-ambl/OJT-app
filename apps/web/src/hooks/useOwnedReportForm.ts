import { useCallback, useMemo, useState } from 'react';
import type { AuthUser } from '../auth/types';
import { useAuth } from '../auth/AuthContext';
import {
  getOwnedReportPersistErrorMessage,
  REPORT_STATUS_SUBMITTED,
  type PutReportFormInput,
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
  getPersistSuccessMessage: () => string;
}

/**
 * 所有報告フォームの共通ロジック（periodKey 生成・復元・提出・一覧からの編集）。
 * 下書きは廃止済みのため、提出（status=submitted）のみをサポートする（BR-R03）。
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
  const currentPeriodKey = useMemo(
    () => formatPeriodKey(new Date()),
    [formatPeriodKey],
  );
  const [periodKey, setPeriodKey] = useState(currentPeriodKey);
  const isEditingPast = periodKey !== currentPeriodKey;

  const { isReady } = useOwnedReportLoader(
    periodKey,
    fetchReport,
    replaceValues,
  );

  /** 一覧カードの「編集」から過去報告を左フォームへ読み込む */
  const loadReportForEdit = useCallback(
    (targetPeriodKey: string, content: TContent): void => {
      setPeriodKey(targetPeriodKey);
      replaceValues(content);
      setPersistFeedback(null);
    },
    [replaceValues],
  );

  /** 「今日/今週の報告に戻る」で編集を終了し、当日/当週のフォームへ戻す */
  const resetToCurrentPeriod = useCallback((): void => {
    setPeriodKey(currentPeriodKey);
    setPersistFeedback(null);
  }, [currentPeriodKey]);

  /** 提出を実行し、成否を返す（呼び出し側で一覧再読み込み等に利用できる） */
  const persist = useCallback(async (): Promise<boolean> => {
    if (!user || !isReady) {
      return false;
    }

    try {
      await putReport(
        periodKey,
        {
          status: REPORT_STATUS_SUBMITTED,
          content: values,
        },
        user,
      );
      setPersistFeedback({
        type: 'success',
        message: getPersistSuccessMessage(),
      });
      return true;
    } catch {
      setPersistFeedback({
        type: 'error',
        message: getOwnedReportPersistErrorMessage(values),
      });
      return false;
    }
  }, [getPersistSuccessMessage, isReady, periodKey, putReport, user, values]);

  return {
    values,
    updateField,
    persist,
    persistFeedback,
    isReady,
    periodKey,
    currentPeriodKey,
    isEditingPast,
    loadReportForEdit,
    resetToCurrentPeriod,
  };
}
