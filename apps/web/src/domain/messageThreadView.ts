import type { AuthUser } from '../auth/types';

export type SyncMessageThreadViews = (
  authUser: AuthUser,
  threadId?: string,
) => Promise<void>;

type ReloadThreadList = (authUser: AuthUser) => Promise<void>;

type ReloadThreadHistory = (
  authUser: AuthUser,
  threadId: string | null,
) => Promise<unknown>;

export function createSyncMessageThreadViews(
  reloadThreadList: ReloadThreadList,
  reloadThreadHistory: ReloadThreadHistory,
  selectedThreadId: string | null,
  setSelectedThreadId: (threadId: string) => void,
): SyncMessageThreadViews {
  return async (authUser, threadId) => {
    const targetThreadId = threadId ?? selectedThreadId;

    if (threadId) {
      setSelectedThreadId(threadId);
    }

    await reloadThreadList(authUser);
    await reloadThreadHistory(authUser, targetThreadId);
  };
}
