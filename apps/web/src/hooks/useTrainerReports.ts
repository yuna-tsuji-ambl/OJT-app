import { useCallback } from 'react';
import { fetchReports } from '../api/reportApi';
import type { AuthUser } from '../auth/types';
import { DEFAULT_TRAINEE_ID } from '../domain/participantConstants';
import {
  type OwnReportListQuery,
  type ReportFormType,
  type ReportResponse,
} from '../domain/reportForm';
import { useFilteredOwnReports } from './useFilteredOwnReports';

const EMPTY_TRAINER_REPORTS: readonly ReportResponse[] = [];

/** トレーナー向け・種別固定の担当新卒報告一覧（検索・期間絞り込み対応） */
export function useTrainerTypedReports(reportType: ReportFormType) {
  const fetchTypedReports = useCallback(
    (user: AuthUser, query: OwnReportListQuery) =>
      fetchReports(DEFAULT_TRAINEE_ID, user, {
        reportType,
        ...query,
      }),
    [reportType],
  );

  return useFilteredOwnReports({
    fetchReports: fetchTypedReports,
    emptyReports: EMPTY_TRAINER_REPORTS,
  });
}
