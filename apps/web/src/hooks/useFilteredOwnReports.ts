import { useCallback, useEffect, useState } from 'react';
import type { AuthUser } from '../auth/types';
import { useAuth } from '../auth/AuthContext';
import {
  hasReportPeriodFilterConflict,
  REPORT_PERIOD_FILTER_CONFLICT_MESSAGE,
  type OwnReportListQuery,
} from '../domain/reportForm';

interface UseFilteredOwnReportsOptions<TReport> {
  fetchReports: (
    user: AuthUser,
    query: OwnReportListQuery,
  ) => Promise<readonly TReport[]>;
  emptyReports: readonly TReport[];
}

export function useFilteredOwnReports<TReport>({
  fetchReports,
  emptyReports,
}: UseFilteredOwnReportsOptions<TReport>) {
  const { user } = useAuth();
  const [reports, setReports] = useState<readonly TReport[]>(emptyReports);
  const [filterError, setFilterError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadReports = useCallback(
    async (authUser: AuthUser, query: OwnReportListQuery = {}) => {
      if (hasReportPeriodFilterConflict(query)) {
        return;
      }

      setIsLoading(true);
      try {
        const nextReports = await fetchReports(authUser, query);
        setReports(nextReports);
        setFilterError(null);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : '一覧の取得に失敗しました';
        setFilterError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [fetchReports],
  );

  const applyFilter = useCallback(
    async (query: OwnReportListQuery) => {
      if (!user) {
        return;
      }

      if (hasReportPeriodFilterConflict(query)) {
        setFilterError(REPORT_PERIOD_FILTER_CONFLICT_MESSAGE);
        return;
      }

      await loadReports(user, query);
    },
    [loadReports, user],
  );

  useEffect(() => {
    if (!user) {
      return;
    }

    void loadReports(user);
  }, [loadReports, user]);

  return {
    reports,
    filterError,
    isLoading,
    applyFilter,
  };
}
