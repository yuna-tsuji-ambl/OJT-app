import { useMemo } from 'react';
import type { MessageAnnouncement } from '@ojt-app/shared';
import type { AuthUser } from '../auth/types';
import {
  MESSAGE_ANNOUNCEMENT_FILTER_LABEL,
  MESSAGE_ANNOUNCEMENT_LIST_LABEL,
  MESSAGE_ANNOUNCEMENT_ROLE_FILTER_OPTIONS,
  MESSAGE_ANNOUNCEMENT_SORT_LABEL,
  MESSAGE_ANNOUNCEMENT_SORT_OPTIONS,
  MESSAGE_ANNOUNCEMENT_TOGGLE_LABEL,
  filterMessageAnnouncementsByRole,
  sortMessageAnnouncements,
  type MessageAnnouncementRoleFilter,
  type MessageAnnouncementSortOption,
} from '../domain/messageAnnouncementList';
import { resolveMessageSenderDisplay } from '../domain/messageThreadSenderDisplay';
import { MessageAnnouncementToggle } from './MessageAnnouncementToggle';
import { MessageListItemMemo } from './MessageListItemMemo';

interface MessageAnnouncementListProps {
  announcements: readonly MessageAnnouncement[];
  viewer: AuthUser;
  sortOption: MessageAnnouncementSortOption;
  onSortOptionChange: (value: MessageAnnouncementSortOption) => void;
  roleFilter: MessageAnnouncementRoleFilter;
  onRoleFilterChange: (value: MessageAnnouncementRoleFilter) => void;
  onSelect: (threadId: string) => void;
  onRemoveAnnouncement: (threadId: string, messageId: string) => void;
  onUpdateMemo: (announcementId: string, memo: string) => void;
}

function resolvePreview(announcement: MessageAnnouncement): string {
  const content = announcement.content?.trim();
  if (content) {
    return content;
  }
  return '（本文を取得できませんでした）';
}

function resolveSenderLabel(
  announcement: MessageAnnouncement,
  viewer: AuthUser,
): string {
  if (!announcement.senderId) {
    return '送信者不明';
  }
  return resolveMessageSenderDisplay(announcement.senderId, viewer).label;
}

export function MessageAnnouncementList({
  announcements,
  viewer,
  sortOption,
  onSortOptionChange,
  roleFilter,
  onRoleFilterChange,
  onSelect,
  onRemoveAnnouncement,
  onUpdateMemo,
}: MessageAnnouncementListProps) {
  const visible = useMemo(() => {
    const filtered = filterMessageAnnouncementsByRole(
      announcements,
      roleFilter,
    );
    return sortMessageAnnouncements(filtered, sortOption);
  }, [announcements, roleFilter, sortOption]);

  return (
    <div
      className="message-announcement-list message-announcement-list--pane"
      role="region"
      aria-label={MESSAGE_ANNOUNCEMENT_LIST_LABEL}
    >
      <div className="message-announcement-list__header">
        <h2 className="message-announcement-list__title">
          {MESSAGE_ANNOUNCEMENT_LIST_LABEL}
        </h2>
        <div className="message-announcement-list__controls">
          <label className="message-announcement-list__filter">
            <span className="message-announcement-list__control-label">
              {MESSAGE_ANNOUNCEMENT_FILTER_LABEL}
            </span>
            <select
              value={roleFilter}
              onChange={(event) =>
                onRoleFilterChange(
                  event.target.value as MessageAnnouncementRoleFilter,
                )
              }
            >
              {MESSAGE_ANNOUNCEMENT_ROLE_FILTER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="message-announcement-list__sort">
            <span className="message-announcement-list__control-label">
              {MESSAGE_ANNOUNCEMENT_SORT_LABEL}
            </span>
            <select
              value={sortOption}
              onChange={(event) =>
                onSortOptionChange(
                  event.target.value as MessageAnnouncementSortOption,
                )
              }
            >
              {MESSAGE_ANNOUNCEMENT_SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
      {visible.length > 0 ? (
        <ul className="message-announcement-list__items">
          {visible.map((announcement) => {
            const senderLabel = resolveSenderLabel(announcement, viewer);
            const content = resolvePreview(announcement);
            const roleLabel =
              announcement.announcedByRole === 'trainer'
                ? 'トレーナー'
                : '新卒';

            return (
              <li key={announcement.id}>
                <div className="message-announcement-list__item">
                  <MessageAnnouncementToggle
                    announced
                    className="message-announcement-list__toggle"
                    ariaLabel={`${MESSAGE_ANNOUNCEMENT_TOGGLE_LABEL}を解除`}
                    onToggle={() =>
                      onRemoveAnnouncement(
                        announcement.threadId,
                        announcement.messageId,
                      )
                    }
                  />
                  <div className="message-announcement-list__main">
                    <button
                      type="button"
                      className="message-announcement-list__body"
                      aria-label={`${senderLabel}: ${content}`}
                      onClick={() => onSelect(announcement.threadId)}
                    >
                      <span className="message-announcement-list__item-sender">
                        {senderLabel}
                      </span>
                      <p className="message-announcement-list__item-content">
                        {content}
                      </p>
                      <div className="message-announcement-list__item-meta">
                        {announcement.messageCreatedAt ? (
                          <time dateTime={announcement.messageCreatedAt}>
                            送信{' '}
                            {new Date(
                              announcement.messageCreatedAt,
                            ).toLocaleString('ja-JP')}
                          </time>
                        ) : null}
                        <time dateTime={announcement.createdAt}>
                          アナウンス追加{' '}
                          {new Date(announcement.createdAt).toLocaleString(
                            'ja-JP',
                          )}{' '}
                          （{roleLabel}）
                        </time>
                      </div>
                    </button>
                    <MessageListItemMemo
                      value={announcement.memo ?? ''}
                      onSave={(memo) => onUpdateMemo(announcement.id, memo)}
                      label="メモ"
                      placeholder="共有メモを入力…"
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
