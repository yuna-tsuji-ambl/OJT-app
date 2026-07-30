import { useCallback, useState } from 'react';
import { fetchReports } from '../api/reportApi';
import type { AuthUser } from '../auth/types';
import { DEFAULT_TRAINEE_ID } from '../domain/participantConstants';
import {
  REPORT_TYPE_FILTER_ALL_VALUE,
  toReportsListTypeQuery,
  type ReportResponse,
  type ReportTypeFilterValue,
} from '../domain/reportForm';
import { useReportList } from './useReportList';

const EMPTY_TRAINER_REPORTS: readonly ReportResponse[] = [];

/** トレーナー向け担当新卒の報告一覧（UC-R04 / U-R35 / E-R10） */
export function useTrainerReports() {
  const [reportTypeFilter, setReportTypeFilter] =
    useState<ReportTypeFilterValue>(REPORT_TYPE_FILTER_ALL_VALUE);

  const fetchAssignedTraineeReports = useCallback(
    (user: AuthUser): Promise<readonly ReportResponse[]> => {
      const reportType = toReportsListTypeQuery(reportTypeFilter);
      return fetchReports(
        DEFAULT_TRAINEE_ID,
        user,
        reportType ? { reportType } : {},
      );
    },
    [reportTypeFilter],
  );

  const { reports } = useReportList(
    fetchAssignedTraineeReports,
    EMPTY_TRAINER_REPORTS,
  );

  return {
    reports,
    reportTypeFilter,
    setReportTypeFilter,
  };
}
