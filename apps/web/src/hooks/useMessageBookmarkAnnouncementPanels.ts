import { useCallback } from 'react';
import type { AuthUser } from '../auth/types';
import { useMessageAnnouncements } from './useMessageAnnouncements';
import { useMessageBookmarks } from './useMessageBookmarks';

/** 右ペインの BM 一覧 / アナウンス一覧を排他的に扱う合成 hook */
export function useMessageBookmarkAnnouncementPanels(user: AuthUser | null) {
  const {
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
    bookmarkError,
  } = useMessageBookmarks(user);

  const {
    announcements,
    announcedMessageIds,
    announcementCount,
    sortOption: announcementSortOption,
    setSortOption: setAnnouncementSortOption,
    roleFilter: announcementRoleFilter,
    setRoleFilter: setAnnouncementRoleFilter,
    showAnnouncements,
    setShowAnnouncements,
    openThreadFromAnnouncementUi,
    toggleMessageAnnouncement,
    updateAnnouncementMemo,
    announcementError,
  } = useMessageAnnouncements(user);

  const toggleShowAnnouncements = useCallback(() => {
    setShowBookmarkedMessages(false);
    setShowAnnouncements((current) => !current);
  }, [setShowAnnouncements, setShowBookmarkedMessages]);

  const toggleShowBookmarkedMessages = useCallback(() => {
    setShowAnnouncements(false);
    setShowBookmarkedMessages((current) => !current);
  }, [setShowAnnouncements, setShowBookmarkedMessages]);

  const selectThreadFromSideUi = useCallback(
    (threadId: string, selectThread: (threadId: string) => void) => {
      setShowAnnouncements(false);
      openThreadFromBookmarkUi(threadId, selectThread);
    },
    [openThreadFromBookmarkUi, setShowAnnouncements],
  );

  const selectThreadFromAnnouncementUi = useCallback(
    (threadId: string, selectThread: (threadId: string) => void) => {
      openThreadFromAnnouncementUi(threadId, selectThread);
    },
    [openThreadFromAnnouncementUi],
  );

  return {
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
    viewThreads,
    toggleThreadBookmark,
    toggleMessageBookmark,
    updateBookmarkMemo,
    bookmarkError,
    announcements,
    announcedMessageIds,
    announcementCount,
    announcementSortOption,
    setAnnouncementSortOption,
    announcementRoleFilter,
    setAnnouncementRoleFilter,
    showAnnouncements,
    toggleShowAnnouncements,
    toggleShowBookmarkedMessages,
    selectThreadFromSideUi,
    selectThreadFromAnnouncementUi,
    toggleMessageAnnouncement,
    updateAnnouncementMemo,
    announcementError,
  };
}
