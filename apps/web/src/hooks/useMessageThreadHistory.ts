import { useCallback } from 'react';
import type { ThreadChatMessage } from '@ojt-app/shared';
import { fetchParticipantThreadHistory } from '../api/messageThreadApi';
import type { AuthUser } from '../auth/types';
import {
  DEFAULT_TRAINEE_ID,
  DEFAULT_TRAINER_ID,
} from '../domain/participantConstants';
import { useRealtimeParticipantResource } from './useRealtimeParticipantResource';

function createThreadHistoryFetcher(threadId: string | null) {
  return (authUser: AuthUser) =>
    fetchParticipantThreadHistory(
      DEFAULT_TRAINER_ID,
      DEFAULT_TRAINEE_ID,
      threadId,
      authUser,
    );
}

export function useMessageThreadHistory(
  user: AuthUser | null,
  threadId: string | null,
) {
  const fetchHistory = useCallback(
    (authUser: AuthUser) => createThreadHistoryFetcher(threadId)(authUser),
    [threadId],
  );

  const { data: threadMessages, reload } = useRealtimeParticipantResource(
    user,
    fetchHistory,
    [] as ThreadChatMessage[],
  );

  const reloadThreadHistory = useCallback(
    async (
      authUser: AuthUser,
      targetThreadId: string | null = threadId,
    ): Promise<ThreadChatMessage[]> =>
      reload(authUser, createThreadHistoryFetcher(targetThreadId)),
    [reload, threadId],
  );

  return { threadMessages, reloadThreadHistory };
}
