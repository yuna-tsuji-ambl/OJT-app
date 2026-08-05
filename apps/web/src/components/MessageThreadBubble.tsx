import type { ThreadChatMessage } from '@ojt-app/shared';
import {
  buildMessageBubbleAriaLabel,
  buildMessageThreadHistoryItemClassName,
  type MessageSenderDisplay,
} from '../domain/messageThreadSenderDisplay';
import { MessageAnnouncementToggle } from './MessageAnnouncementToggle';
import { MessageBookmarkToggle } from './MessageBookmarkToggle';

interface MessageThreadBubbleProps {
  message: ThreadChatMessage;
  display: MessageSenderDisplay;
  timeLabel: string;
  bookmarked?: boolean;
  onToggleBookmark?: (messageId: string) => void;
  announced?: boolean;
  onToggleAnnouncement?: (messageId: string) => void;
}

export function MessageThreadBubble({
  message,
  display,
  timeLabel,
  bookmarked = false,
  onToggleBookmark,
  announced = false,
  onToggleAnnouncement,
}: MessageThreadBubbleProps) {
  return (
    <li className={buildMessageThreadHistoryItemClassName(display.role)}>
      <article
        className="message-thread-bubble"
        data-sender={display.role}
        aria-label={buildMessageBubbleAriaLabel(display.label, message.content)}
      >
        <p className="message-thread-bubble__content">{message.content}</p>
        <div className="message-thread-bubble__meta">
          {onToggleBookmark ? (
            <MessageBookmarkToggle
              bookmarked={bookmarked}
              onToggle={() => onToggleBookmark(message.id)}
            />
          ) : null}
          {onToggleAnnouncement ? (
            <MessageAnnouncementToggle
              announced={announced}
              onToggle={() => onToggleAnnouncement(message.id)}
            />
          ) : null}
          {timeLabel ? (
            <time
              className="message-thread-bubble__time"
              dateTime={message.createdAt}
            >
              {timeLabel}
            </time>
          ) : null}
        </div>
      </article>
    </li>
  );
}
