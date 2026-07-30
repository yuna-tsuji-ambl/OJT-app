import type { AuthUser } from '../auth/types';
import { useAuth } from '../auth/AuthContext';
import { useAuthParticipantResource } from './useAuthParticipantResource';

/** 認証ユーザーに紐づく報告一覧を取得する汎用フック */
export function useReportList<TReport>(
  fetcher: (user: AuthUser) => Promise<readonly TReport[]>,
  emptyReports: readonly TReport[],
): { reports: readonly TReport[] } {
  const { user } = useAuth();
  const { data: reports } = useAuthParticipantResource(
    user,
    fetcher,
    emptyReports,
  );

  return { reports };
}
