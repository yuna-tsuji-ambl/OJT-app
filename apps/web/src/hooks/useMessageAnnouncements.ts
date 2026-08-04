import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { MessageAnnouncement } from '@ojt-app/shared';
import {
  createMessageAnnouncement,
  deleteMessageAnnouncement,
  fetchMessageAnnouncements,
  updateMessageAnnouncementMemo,
} from '../api/messageAnnouncementApi';
import type { AuthUser } from '../auth/types';
import {
  collectAnnouncedMessageIds,
  DEFAULT_MESSAGE_ANNOUNCEMENT_ROLE_FILTER,
  DEFAULT_MESSAGE_ANNOUNCEMENT_SORT,
  filterMessageAnnouncementsByRole,
  sortMessageAnnouncements,
  type MessageAnnouncementRoleFilter,
  type MessageAnnouncementSortOption,
} from '../domain/messageAnnouncementList';

export function useMessageAnnouncements(user: AuthUser | null) {
  const [announcements, setAnnouncements] = useState<MessageAnnouncement[]>([]);
  const [sortOption, setSortOption] = useState<MessageAnnouncementSortOption>(
    DEFAULT_MESSAGE_ANNOUNCEMENT_SORT,
  );
  const [roleFilter, setRoleFilter] = useState<MessageAnnouncementRoleFilter>(
    DEFAULT_MESSAGE_ANNOUNCEMENT_ROLE_FILTER,
  );
  const [showAnnouncements, setShowAnnouncements] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pendingKeysRef = useRef(new Set<string>());
  const announcementsRef = useRef(announcements);

  const reload = useCallback(async (authUser: AuthUser) => {
    const next = await fetchMessageAnnouncements(authUser);
    setAnnouncements(next);
  }, []);

  useEffect(() => {
    announcementsRef.current = announcements;
  }, [announcements]);

  useEffect(() => {
    if (!user) {
      setAnnouncements([]);
      return;
    }
    void reload(user).catch(() => {
      setAnnouncements([]);
    });
  }, [reload, user]);

  const announcedMessageIds = useMemo(
    () => collectAnnouncedMessageIds(announcements),
    [announcements],
  );

  const visibleAnnouncements = useMemo(() => {
    const filtered = filterMessageAnnouncementsByRole(
      announcements,
      roleFilter,
    );
    return sortMessageAnnouncements(filtered, sortOption);
  }, [announcements, roleFilter, sortOption]);

  const announcementCount = announcements.length;

  const openThreadFromAnnouncementUi = useCallback(
    (threadId: string, selectThread: (threadId: string) => void) => {
      setShowAnnouncements(false);
      selectThread(threadId);
    },
    [],
  );

  const toggleMessageAnnouncement = useCallback(
    async (threadId: string, messageId: string) => {
      if (!user || pendingKeysRef.current.has(messageId)) {
        return;
      }
      pendingKeysRef.current.add(messageId);
      setError(null);
      try {
        const existing = announcementsRef.current.find(
          (announcement) => announcement.messageId === messageId,
        );
        if (existing) {
          await deleteMessageAnnouncement(user, existing.id);
        } else {
          await createMessageAnnouncement(user, { threadId, messageId });
        }
        await reload(user);
      } catch (caught: unknown) {
        setError(
          caught instanceof Error
            ? caught.message
            : 'アナウンスを更新できませんでした',
        );
      } finally {
        pendingKeysRef.current.delete(messageId);
      }
    },
    [reload, user],
  );

  const updateAnnouncementMemo = useCallback(
    async (announcementId: string, memo: string) => {
      if (!user) {
        return;
      }
      setError(null);
      try {
        await updateMessageAnnouncementMemo(user, announcementId, memo);
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
    announcements,
    visibleAnnouncements,
    announcedMessageIds,
    announcementCount,
    sortOption,
    setSortOption,
    roleFilter,
    setRoleFilter,
    showAnnouncements,
    setShowAnnouncements,
    openThreadFromAnnouncementUi,
    toggleMessageAnnouncement,
    updateAnnouncementMemo,
    announcementError: error,
  };
}
