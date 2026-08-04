import { useMemo } from 'react';
import type { MessageBookmark } from '@ojt-app/shared';
import type { AuthUser } from '../auth/types';
import {
  MESSAGE_BOOKMARK_MESSAGES_LIST_LABEL,
  MESSAGE_BOOKMARK_SORT_LABEL,
  MESSAGE_BOOKMARK_SORT_OPTIONS,
  MESSAGE_BOOKMARK_TOGGLE_LABEL,
  sortMessageBookmarks,
  type MessageBookmarkSortOption,
} from '../domain/messageBookmarkList';
import { resolveMessageSenderDisplay } from '../domain/messageThreadSenderDisplay';
import { MessageBookmarkToggle } from './MessageBookmarkToggle';
import { MessageListItemMemo } from './MessageListItemMemo';

interface MessageBookmarkedMessageListProps {
  bookmarks: readonly MessageBookmark[];
  viewer: AuthUser;
  sortOption: MessageBookmarkSortOption;
  onSortOptionChange: (value: MessageBookmarkSortOption) => void;
  onSelect: (threadId: string) => void;
  onRemoveBookmark: (threadId: string, messageId: string) => void;
  onUpdateMemo: (bookmarkId: string, memo: string) => void;
}

function resolveBookmarkPreview(bookmark: MessageBookmark): string {
  const content = bookmark.content?.trim();
  if (content) {
    return content;
  }
  return '（本文を取得できませんでした）';
}

function resolveBookmarkSenderLabel(
  bookmark: MessageBookmark,
  viewer: AuthUser,
): string {
  if (!bookmark.senderId) {
    return '送信者不明';
  }
  return resolveMessageSenderDisplay(bookmark.senderId, viewer).label;
}

function resolveDisplayTimes(bookmark: MessageBookmark): {
  sentAt: string | undefined;
  bookmarkedAt: string;
} {
  return {
    sentAt: bookmark.messageCreatedAt,
    bookmarkedAt: bookmark.createdAt,
  };
}

export function MessageBookmarkedMessageList({
  bookmarks,
  viewer,
  sortOption,
  onSortOptionChange,
  onSelect,
  onRemoveBookmark,
  onUpdateMemo,
}: MessageBookmarkedMessageListProps) {
  const sortedBookmarks = useMemo(
    () => sortMessageBookmarks(bookmarks, sortOption),
    [bookmarks, sortOption],
  );

  return (
    <div
      className="message-bookmarked-message-list message-bookmarked-message-list--pane"
      role="region"
      aria-label={MESSAGE_BOOKMARK_MESSAGES_LIST_LABEL}
    >
      <div className="message-bookmarked-message-list__header">
        <h2 className="message-bookmarked-message-list__title">
          {MESSAGE_BOOKMARK_MESSAGES_LIST_LABEL}
        </h2>
        <label className="message-bookmarked-message-list__sort">
          <span className="message-bookmarked-message-list__sort-label">
            {MESSAGE_BOOKMARK_SORT_LABEL}
          </span>
          <select
            value={sortOption}
            onChange={(event) =>
              onSortOptionChange(
                event.target.value as MessageBookmarkSortOption,
              )
            }
          >
            {MESSAGE_BOOKMARK_SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      {sortedBookmarks.length > 0 ? (
        <ul className="message-bookmarked-message-list__items">
          {sortedBookmarks.map((bookmark) => {
            const senderLabel = resolveBookmarkSenderLabel(bookmark, viewer);
            const content = resolveBookmarkPreview(bookmark);
            const { sentAt, bookmarkedAt } = resolveDisplayTimes(bookmark);
            const messageId = bookmark.messageId;

            return (
              <li key={bookmark.id}>
                <div className="message-bookmarked-message-list__item">
                  <MessageBookmarkToggle
                    bookmarked
                    className="message-bookmarked-message-list__heart"
                    ariaLabel={`${MESSAGE_BOOKMARK_TOGGLE_LABEL}を解除`}
                    onToggle={() => {
                      if (messageId) {
                        onRemoveBookmark(bookmark.threadId, messageId);
                      }
                    }}
                  />
                  <div className="message-bookmarked-message-list__main">
                    <button
                      type="button"
                      className="message-bookmarked-message-list__body"
                      aria-label={`${senderLabel}: ${content}`}
                      onClick={() => onSelect(bookmark.threadId)}
                    >
                      <span className="message-bookmarked-message-list__item-sender">
                        {senderLabel}
                      </span>
                      <p className="message-bookmarked-message-list__item-content">
                        {content}
                      </p>
                      <div className="message-bookmarked-message-list__item-meta">
                        {sentAt ? (
                          <time dateTime={sentAt}>
                            送信 {new Date(sentAt).toLocaleString('ja-JP')}
                          </time>
                        ) : null}
                        <time dateTime={bookmarkedAt}>
                          BM追加{' '}
                          {new Date(bookmarkedAt).toLocaleString('ja-JP')}
                        </time>
                      </div>
                    </button>
                    <MessageListItemMemo
                      value={bookmark.memo ?? ''}
                      onSave={(memo) => onUpdateMemo(bookmark.id, memo)}
                      label="メモ"
                      placeholder="個人メモを入力…"
                    />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
