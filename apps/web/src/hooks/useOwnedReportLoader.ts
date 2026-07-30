import { useEffect, useState } from 'react';
import type { AuthUser } from '../auth/types';
import { useAuth } from '../auth/AuthContext';

export interface OwnedReportWithContent<
  TContent extends Record<string, string>,
> {
  content: TContent;
}

/**
 * 認証済みユーザーの所有報告を periodKey で取得し、フォーム値へ反映する。
 * 取得完了まで isReady=false（入力との競合を防ぐ）。
 */
export function useOwnedReportLoader<TContent extends Record<string, string>>(
  periodKey: string,
  fetchReport: (
    periodKey: string,
    user: AuthUser,
  ) => Promise<OwnedReportWithContent<TContent> | null>,
  replaceValues: (content: TContent) => void,
): { isReady: boolean } {
  const { user } = useAuth();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    let cancelled = false;
    setIsReady(false);

    void fetchReport(periodKey, user)
      .then((report) => {
        if (cancelled) {
          return;
        }
        if (report) {
          replaceValues(report.content);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsReady(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user, periodKey, fetchReport, replaceValues]);

  return { isReady };
}
