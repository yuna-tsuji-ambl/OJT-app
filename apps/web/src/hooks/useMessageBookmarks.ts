import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { MessageBookmark, MessageThreadListItem } from '@ojt-app/shared';
import {
  createMessageBookmark,
  deleteMessageBookmark,
  fetchMessageBookmarks,
  updateMessageBookmarkMemo,
} from '../api/messageBookmarkApi';
import type { AuthUser } from '../auth/types';
import {
  collectBookmarkedMessageIds,
  collectBookmarkedThreadIds,
  collectThreadBookmarkedAtById,
  DEFAULT_MESSAGE_BOOKMARK_SORT,
  DEFAULT_THREAD_BOOKMARK_SORT,
  filterThreadsByBookmark,
  listMessageBookmarksOnly,
  sortThreadListItemsByBookmark,
  type MessageBookmarkSortOption,
  type ThreadBookmarkSortOption,
} from '../domain/messageBookmarkList';

function threadToggleKey(threadId: string): string {
  return `thread:${threadId}`;
}

function messageToggleKey(messageId: string): string {
  return `message:${messageId}`;
}

export function useMessageBookmarks(user: AuthUser | null) {
  const [bookmarks, setBookmarks] = useState<MessageBookmark[]>([]);
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);
  const [threadSortOption, setThreadSortOption] =
    useState<ThreadBookmarkSortOption>(DEFAULT_THREAD_BOOKMARK_SORT);
  const [messageSortOption, setMessageSortOption] =
    useState<MessageBookmarkSortOption>(DEFAULT_MESSAGE_BOOKMARK_SORT);
  const [showBookmarkedMessages, setShowBookmarkedMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pendingKeysRef = useRef(new Set<string>());
  const bookmarksRef = useRef(bookmarks);

  const reload = useCallback(async (authUser: AuthUser) => {
    const next = await fetchMessageBookmarks(authUser);
    setBookmarks(next);
  }, []);

  useEffect(() => {
    bookmarksRef.current = bookmarks;
  }, [bookmarks]);

  useEffect(() => {
    if (!user) {
      setBookmarks([]);
      return;
    }
    // 取得失敗は画面に出さず空一覧のまま（更新失敗アラートは runToggle 側）
    void reload(user).catch(() => {
      setBookmarks([]);
    });
  }, [reload, user]);

  const bookmarkedThreadIds = useMemo(
    () => collectBookmarkedThreadIds(bookmarks),
    [bookmarks],
  );
  const bookmarkedMessageIds = useMemo(
    () => collectBookmarkedMessageIds(bookmarks),
    [bookmarks],
  );
  const messageBookmarks = useMemo(
    () => listMessageBookmarksOnly(bookmarks),
    [bookmarks],
  );
  const threadBookmarkedAtById = useMemo(
    () => collectThreadBookmarkedAtById(bookmarks),
    [bookmarks],
  );

  const viewThreads = useCallback(
    (threads: readonly MessageThreadListItem[]): MessageThreadListItem[] => {
      const filtered = filterThreadsByBookmark(
        threads,
        bookmarkedThreadIds,
        bookmarkedOnly,
      );
      return sortThreadListItemsByBookmark(
        filtered,
        threadSortOption,
        threadBookmarkedAtById,
      );
    },
    [
      bookmarkedOnly,
      bookmarkedThreadIds,
      threadBookmarkedAtById,
      threadSortOption,
    ],
  );

  const openThreadFromBookmarkUi = useCallback(
    (threadId: string, selectThread: (threadId: string) => void) => {
      setShowBookmarkedMessages(false);
      selectThread(threadId);
    },
    [],
  );

  const runToggle = useCallback(
    async (key: string, mutate: (authUser: AuthUser) => Promise<void>) => {
      if (!user || pendingKeysRef.current.has(key)) {
        return;
      }
      pendingKeysRef.current.add(key);
      setError(null);
      try {
        await mutate(user);
        await reload(user);
      } catch (caught: unknown) {
        setError(
          caught instanceof Error
            ? caught.message
            : 'ブックマークを更新できませんでした',
        );
      } finally {
        pendingKeysRef.current.delete(key);
      }
    },
    [reload, user],
  );

  const toggleThreadBookmark = useCallback(
    async (threadId: string) => {
      await runToggle(threadToggleKey(threadId), async (authUser) => {
        const existing = bookmarksRef.current.find(
          (bookmark) =>
            bookmark.targetType === 'thread' && bookmark.threadId === threadId,
        );
        if (existing) {
          await deleteMessageBookmark(authUser, existing.id);
        } else {
          await createMessageBookmark(authUser, {
            targetType: 'thread',
            threadId,
          });
        }
      });
    },
    [runToggle],
  );

  const toggleMessageBookmark = useCallback(
    async (threadId: string, messageId: string) => {
      await runToggle(messageToggleKey(messageId), async (authUser) => {
        const existing = bookmarksRef.current.find(
          (bookmark) =>
            bookmark.targetType === 'message' &&
            bookmark.messageId === messageId,
        );
        if (existing) {
          await deleteMessageBookmark(authUser, existing.id);
        } else {
          await createMessageBookmark(authUser, {
            targetType: 'message',
            threadId,
            messageId,
          });
        }
      });
    },
    [runToggle],
  );

  const updateBookmarkMemo = useCallback(
    async (bookmarkId: string, memo: string) => {
      if (!user) {
        return;
      }
      setError(null);
      try {
        await updateMessageBookmarkMemo(user, bookmarkId, memo);
        await reload(user);
      } catch (caught: unknown) {
        setError(
          caught instanceof Error
            ? caught.message
            : 'メモを保存できませんでした',
        );
      }
    },
    [reload, user],
  );

  return {
    bookmarks,
    messageBookmarks,
    bookmarkedThreadIds,
    bookmarkedMessageIds,
    threadBookmarkedAtById,
    bookmarkedOnly,
    setBookmarkedOnly,
    threadSortOption,
    setThreadSortOption,
    messageSortOption,
    setMessageSortOption,
    showBookmarkedMessages,
    setShowBookmarkedMessages,
    viewThreads,
    openThreadFromBookmarkUi,
    toggleThreadBookmark,
    toggleMessageBookmark,
    updateBookmarkMemo,
    bookmarkError: error,
  };
}
