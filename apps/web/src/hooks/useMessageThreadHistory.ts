import { useCallback, useMemo, useState } from 'react';
import type { ThreadChatMessage } from '@ojt-app/shared';
import { fetchParticipantThreadHistory } from '../api/messageThreadApi';
import type { AuthUser } from '../auth/types';
import {
  DEFAULT_TRAINEE_ID,
  DEFAULT_TRAINER_ID,
} from '../domain/participantConstants';
import { MESSAGE_THREAD_HISTORY_LOAD_ERROR_TEXT } from '../domain/messageThreadList';
import { useRealtimeParticipantResource } from './useRealtimeParticipantResource';

type ThreadHistoryLoadResult = {
  threadId: string | null;
  messages: ThreadChatMessage[];
};

const EMPTY_HISTORY: ThreadHistoryLoadResult = {
  threadId: null,
  messages: [],
};

function createThreadHistoryFetcher(threadId: string | null) {
  return async (authUser: AuthUser): Promise<ThreadHistoryLoadResult> => {
    if (!threadId) {
      return EMPTY_HISTORY;
    }

    const messages = await fetchParticipantThreadHistory(
      DEFAULT_TRAINER_ID,
      DEFAULT_TRAINEE_ID,
      threadId,
      authUser,
    );
    return { threadId, messages };
  };
}

export function useMessageThreadHistory(
  user: AuthUser | null,
  threadId: string | null,
) {
  const [historyError, setHistoryError] = useState<string | null>(null);

  const fetchHistory = useCallback(
    async (authUser: AuthUser): Promise<ThreadHistoryLoadResult> => {
      if (!threadId) {
        setHistoryError(null);
        return EMPTY_HISTORY;
      }

      try {
        setHistoryError(null);
        return await createThreadHistoryFetcher(threadId)(authUser);
      } catch {
        setHistoryError(MESSAGE_THREAD_HISTORY_LOAD_ERROR_TEXT);
        return { threadId, messages: [] };
      }
    },
    [threadId],
  );

  const { data: loadedHistory, reload } = useRealtimeParticipantResource(
    user,
    fetchHistory,
    EMPTY_HISTORY,
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
        const result = await reload(
          authUser,
          createThreadHistoryFetcher(targetThreadId),
        );
        return result.messages;
      } catch {
        setHistoryError(MESSAGE_THREAD_HISTORY_LOAD_ERROR_TEXT);
        return [];
      }
    },
    [reload, threadId],
  );

  // 選択中トークと紐づく結果だけを表示（古い in-flight 応答の混入を防ぐ）
  const threadMessages = useMemo(() => {
    if (!threadId || loadedHistory.threadId !== threadId) {
      return [];
    }
    return loadedHistory.messages;
  }, [loadedHistory, threadId]);

  return { threadMessages, reloadThreadHistory, historyError };
}
