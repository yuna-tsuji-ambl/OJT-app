import { useEffect } from 'react';
import type { AuthUser } from '../auth/types';
import { MESSAGE_UPDATE_POLL_INTERVAL_MS } from '../domain/messageRealtimeConstants';
import { useAuthParticipantResource } from './useAuthParticipantResource';

export function useRealtimeParticipantResource<T>(
  user: AuthUser | null,
  fetcher: (authUser: AuthUser) => Promise<T>,
  initialValue: T,
) {
  const { data, reload } = useAuthParticipantResource(
    user,
    fetcher,
    initialValue,
  );

  useEffect(() => {
    if (!user) {
      return;
    }

    const intervalId = setInterval(() => {
      void reload(user);
    }, MESSAGE_UPDATE_POLL_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [reload, user]);

  return { data, reload };
}
