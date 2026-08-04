import { useCallback, useEffect, useRef, useState } from 'react';
import type { AuthUser } from '../auth/types';

export function useAuthParticipantResource<T>(
  user: AuthUser | null,
  fetcher: (authUser: AuthUser) => Promise<T>,
  initialValue: T,
) {
  const [data, setData] = useState(initialValue);
  const requestIdRef = useRef(0);

  const reload = useCallback(
    async (
      authUser: AuthUser,
      fetchOverride?: (authUser: AuthUser) => Promise<T>,
    ): Promise<T> => {
      const requestId = ++requestIdRef.current;
      const nextData = await (fetchOverride ?? fetcher)(authUser);
      // 古い in-flight 応答で新しい履歴／一覧を上書きしない
      if (requestId === requestIdRef.current) {
        setData(nextData);
      }
      return nextData;
    },
    [fetcher],
  );

  useEffect(() => {
    if (!user) {
      return;
    }

    void reload(user);
  }, [reload, user]);

  return { data, reload };
}
