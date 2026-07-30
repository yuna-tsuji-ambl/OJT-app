import { useCallback } from 'react';
import { fetchReportById } from '../api/reportApi';
import { useAuth } from '../auth/AuthContext';
import type { AuthUser } from '../auth/types';
import type { ReportResponse } from '../domain/reportForm';
import { useAuthParticipantResource } from './useAuthParticipantResource';

async function fetchReportByIdOrNull(
  reportId: string | undefined,
  authUser: AuthUser,
): Promise<ReportResponse | null> {
  if (!reportId) {
    return null;
  }
  return fetchReportById(reportId, authUser);
}

/** 報告 ID 指定で詳細を取得する（§8.6.2 / U-R36 / P-R01） */
export function useReportById(reportId: string | undefined): {
  report: ReportResponse | null;
  reload: (authUser: AuthUser) => Promise<ReportResponse | null>;
} {
  const { user } = useAuth();

  const fetcher = useCallback(
    (authUser: AuthUser) => fetchReportByIdOrNull(reportId, authUser),
    [reportId],
  );

  const { data: report, reload } = useAuthParticipantResource(
    user,
    fetcher,
    null,
  );

  return { report, reload };
}
