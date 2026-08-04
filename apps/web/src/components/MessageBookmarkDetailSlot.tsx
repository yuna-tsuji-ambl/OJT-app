import type { ReactNode } from 'react';
import type {
  MessageAnnouncement,
  MessageBookmark,
  ThreadChatMessage,
} from '@ojt-app/shared';
import type { AuthUser } from '../auth/types';
import type {
  MessageAnnouncementRoleFilter,
  MessageAnnouncementSortOption,
} from '../domain/messageAnnouncementList';
import type { MessageBookmarkSortOption } from '../domain/messageBookmarkList';
import { MessageAnnouncementList } from './MessageAnnouncementList';
import { MessageBookmarkedMessageList } from './MessageBookmarkedMessageList';
import { MessageThreadDetailPane } from './MessageThreadDetailPane';

interface MessageBookmarkDetailSlotProps {
  showAnnouncements?: boolean;
  announcements?: readonly MessageAnnouncement[];
  announcementSortOption?: MessageAnnouncementSortOption;
  onAnnouncementSortOptionChange?: (
    value: MessageAnnouncementSortOption,
  ) => void;
  announcementRoleFilter?: MessageAnnouncementRoleFilter;
  onAnnouncementRoleFilterChange?: (
    value: MessageAnnouncementRoleFilter,
  ) => void;
  onSelectAnnouncement?: (threadId: string) => void;
  onRemoveAnnouncement?: (threadId: string, messageId: string) => void;
  onUpdateAnnouncementMemo?: (announcementId: string, memo: string) => void;
  showBookmarkedMessages: boolean;
  messageBookmarks: readonly MessageBookmark[];
  viewer: AuthUser;
  messageSortOption: MessageBookmarkSortOption;
  onMessageSortOptionChange: (value: MessageBookmarkSortOption) => void;
  onSelectBookmarkedMessage: (threadId: string) => void;
  onRemoveMessageBookmark: (threadId: string, messageId: string) => void;
  onUpdateBookmarkMemo?: (bookmarkId: string, memo: string) => void;
  selectedThreadId: string | null;
  messages: ThreadChatMessage[];
  historyError: string | null;
  bookmarkedMessageIds: ReadonlySet<string>;
  onToggleMessageBookmark: (messageId: string) => void;
  announcedMessageIds?: ReadonlySet<string>;
  onToggleMessageAnnouncement?: (messageId: string) => void;
  children: ReactNode;
}

/** 右ペイン: アナウンス一覧 / BM メッセージ一覧 / 選択中トーク詳細 */
export function MessageBookmarkDetailSlot({
  showAnnouncements = false,
  announcements = [],
  announcementSortOption = 'announcedDesc',
  onAnnouncementSortOptionChange,
  announcementRoleFilter = 'all',
  onAnnouncementRoleFilterChange,
  onSelectAnnouncement,
  onRemoveAnnouncement,
  onUpdateAnnouncementMemo,
  showBookmarkedMessages,
  messageBookmarks,
  viewer,
  messageSortOption,
  onMessageSortOptionChange,
  onSelectBookmarkedMessage,
  onRemoveMessageBookmark,
  onUpdateBookmarkMemo,
  selectedThreadId,
  messages,
  historyError,
  bookmarkedMessageIds,
  onToggleMessageBookmark,
  announcedMessageIds,
  onToggleMessageAnnouncement,
  children,
}: MessageBookmarkDetailSlotProps) {
  if (showAnnouncements) {
    return (
      <MessageAnnouncementList
        announcements={announcements}
        viewer={viewer}
        sortOption={announcementSortOption}
        onSortOptionChange={onAnnouncementSortOptionChange ?? (() => undefined)}
        roleFilter={announcementRoleFilter}
        onRoleFilterChange={onAnnouncementRoleFilterChange ?? (() => undefined)}
        onSelect={onSelectAnnouncement ?? (() => undefined)}
        onRemoveAnnouncement={onRemoveAnnouncement ?? (() => undefined)}
        onUpdateMemo={onUpdateAnnouncementMemo ?? (() => undefined)}
      />
    );
  }

  if (showBookmarkedMessages) {
    return (
      <MessageBookmarkedMessageList
        bookmarks={messageBookmarks}
        viewer={viewer}
        sortOption={messageSortOption}
        onSortOptionChange={onMessageSortOptionChange}
        onSelect={onSelectBookmarkedMessage}
        onRemoveBookmark={onRemoveMessageBookmark}
        onUpdateMemo={onUpdateBookmarkMemo ?? (() => undefined)}
      />
    );
  }

  if (!selectedThreadId) {
    return null;
  }

  return (
    <MessageThreadDetailPane
      threadId={selectedThreadId}
      viewer={viewer}
      messages={messages}
      historyError={historyError}
      bookmarkedMessageIds={bookmarkedMessageIds}
      onToggleMessageBookmark={onToggleMessageBookmark}
      announcedMessageIds={announcedMessageIds}
      onToggleMessageAnnouncement={onToggleMessageAnnouncement}
    >
      {children}
    </MessageThreadDetailPane>
  );
}
