import { sortMessageThreadListItemsByLatestActivity } from '@ojt-app/shared';
import { useCallback } from 'react';
import { fetchMessageThreads } from '../api/messageThreadApi';
import type { AuthUser } from '../auth/types';
import {
  DEFAULT_TRAINEE_ID,
  DEFAULT_TRAINER_ID,
} from '../domain/participantConstants';
import { useRealtimeParticipantResource } from './useRealtimeParticipantResource';

export function useMessageThreads(user: AuthUser | null) {
  const fetchThreads = useCallback(async (authUser: AuthUser) => {
    const threads = await fetchMessageThreads(
      DEFAULT_TRAINER_ID,
      DEFAULT_TRAINEE_ID,
      authUser,
    );

    return sortMessageThreadListItemsByLatestActivity(threads);
  }, []);

  const { data: threads, reload: reloadThreads } =
    useRealtimeParticipantResource(user, fetchThreads, []);

  return { threads, reloadThreads };
}
