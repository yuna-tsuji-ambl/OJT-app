import { useCallback, useMemo } from 'react';
import type { AuthUser } from '../auth/types';
import { createSyncMessageThreadViews } from '../domain/messageThreadView';
import { useMessageThreadHistory } from './useMessageThreadHistory';
import { useMessageThreads } from './useMessageThreads';
import { useSelectedMessageThread } from './useSelectedMessageThread';

export function useMessageThreadRooms(user: AuthUser | null) {
  const { selectedThreadId, setSelectedThreadId } = useSelectedMessageThread();
  const { threads, reloadThreads } = useMessageThreads(user);
  const { threadMessages, reloadThreadHistory } = useMessageThreadHistory(
    user,
    selectedThreadId,
  );

  const reloadThreadList = useCallback(
    async (authUser: AuthUser): Promise<void> => {
      await reloadThreads(authUser);
    },
    [reloadThreads],
  );

  const syncThreadViews = useMemo(
    () =>
      createSyncMessageThreadViews(
        reloadThreadList,
        reloadThreadHistory,
        selectedThreadId,
        setSelectedThreadId,
      ),
    [
      reloadThreadHistory,
      reloadThreadList,
      selectedThreadId,
      setSelectedThreadId,
    ],
  );

  const selectThread = useCallback(
    (threadId: string) => {
      setSelectedThreadId(threadId);
      if (user) {
        void reloadThreadHistory(user, threadId);
      }
    },
    [reloadThreadHistory, setSelectedThreadId, user],
  );

  return {
    threads,
    threadMessages,
    selectedThreadId,
    selectThread,
    syncThreadViews,
    reloadThreadList,
  };
}
