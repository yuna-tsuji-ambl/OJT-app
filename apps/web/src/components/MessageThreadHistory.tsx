import type { ThreadChatMessage } from '@ojt-app/shared';
import type { AuthUser } from '../auth/types';
import { MESSAGE_THREAD_HISTORY_LOG_LABEL } from '../domain/messageThreadHistory';
import { resolveMessageSenderDisplay } from '../domain/messageThreadSenderDisplay';
import { buildThreadHistoryRows } from '../domain/messageThreadTimestamp';
import { useMessageThreadHistoryViewport } from '../hooks/useMessageThreadHistoryViewport';
import { MessageThreadBubble } from './MessageThreadBubble';

interface MessageThreadHistoryProps {
  messages: ThreadChatMessage[];
  viewer: AuthUser;
  bookmarkedMessageIds?: ReadonlySet<string>;
  onToggleMessageBookmark?: (messageId: string) => void;
  announcedMessageIds?: ReadonlySet<string>;
  onToggleMessageAnnouncement?: (messageId: string) => void;
}

export function MessageThreadHistory({
  messages,
  viewer,
  bookmarkedMessageIds,
  onToggleMessageBookmark,
  announcedMessageIds,
  onToggleMessageAnnouncement,
}: MessageThreadHistoryProps) {
  const historyRef = useMessageThreadHistoryViewport(messages);
  const rows = buildThreadHistoryRows(messages);

  return (
    <div
      ref={historyRef}
      className="message-thread-history"
      role="log"
      aria-label={MESSAGE_THREAD_HISTORY_LOG_LABEL}
    >
      <ul className="message-thread-history-list">
        {rows.map((row) => {
          if (row.kind === 'date-separator') {
            return (
              <li
                key={`date-${row.dateKey}`}
                className="message-thread-date-separator"
              >
                <time dateTime={row.dateKey}>{row.label}</time>
              </li>
            );
          }

          return (
            <MessageThreadBubble
              key={row.message.id}
              message={row.message}
              display={resolveMessageSenderDisplay(
                row.message.senderId,
                viewer,
              )}
              timeLabel={row.timeLabel}
              bookmarked={bookmarkedMessageIds?.has(row.message.id) ?? false}
              onToggleBookmark={onToggleMessageBookmark}
              announced={announcedMessageIds?.has(row.message.id) ?? false}
              onToggleAnnouncement={onToggleMessageAnnouncement}
            />
          );
        })}
      </ul>
    </div>
  );
}
