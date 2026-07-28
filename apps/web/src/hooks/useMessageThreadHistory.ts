import { useCallback, useState } from 'react';
import type { ThreadChatMessage } from '@ojt-app/shared';
import { fetchParticipantThreadHistory } from '../api/messageThreadApi';
import type { AuthUser } from '../auth/types';
import {
  DEFAULT_TRAINEE_ID,
  DEFAULT_TRAINER_ID,
} from '../domain/participantConstants';
import { MESSAGE_THREAD_HISTORY_LOAD_ERROR_TEXT } from '../domain/messageThreadList';
import { useRealtimeParticipantResource } from './useRealtimeParticipantResource';

function createThreadHistoryFetcher(threadId: string | null) {
  return async (authUser: AuthUser): Promise<ThreadChatMessage[]> => {
    if (!threadId) {
      return [];
    }

    return fetchParticipantThreadHistory(
      DEFAULT_TRAINER_ID,
      DEFAULT_TRAINEE_ID,
      threadId,
      authUser,
    );
  };
}

export function useMessageThreadHistory(
  user: AuthUser | null,
  threadId: string | null,
) {
  const [historyError, setHistoryError] = useState<string | null>(null);

  const fetchHistory = useCallback(
    async (authUser: AuthUser): Promise<ThreadChatMessage[]> => {
      if (!threadId) {
        setHistoryError(null);
        return [];
      }

      try {
        setHistoryError(null);
        return await createThreadHistoryFetcher(threadId)(authUser);
      } catch {
        setHistoryError(MESSAGE_THREAD_HISTORY_LOAD_ERROR_TEXT);
        return [];
      }
    },
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
    ): Promise<ThreadChatMessage[]> => {
      if (!targetThreadId) {
        setHistoryError(null);
        return [];
      }

      try {
        setHistoryError(null);
        return await reload(
          authUser,
          createThreadHistoryFetcher(targetThreadId),
        );
      } catch {
        setHistoryError(MESSAGE_THREAD_HISTORY_LOAD_ERROR_TEXT);
        return [];
      }
    },
    [reload, threadId],
  );

  return { threadMessages, reloadThreadHistory, historyError };
}
