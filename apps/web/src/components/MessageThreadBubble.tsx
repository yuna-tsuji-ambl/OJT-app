import type { ThreadChatMessage } from '@ojt-app/shared';
import {
  buildMessageBubbleAriaLabel,
  buildMessageThreadHistoryItemClassName,
  type MessageSenderDisplay,
} from '../domain/messageThreadSenderDisplay';

interface MessageThreadBubbleProps {
  message: ThreadChatMessage;
  display: MessageSenderDisplay;
}

export function MessageThreadBubble({
  message,
  display,
}: MessageThreadBubbleProps) {
  return (
    <li className={buildMessageThreadHistoryItemClassName(display.role)}>
      <article
        className="message-thread-bubble"
        data-sender={display.role}
        aria-label={buildMessageBubbleAriaLabel(display.label, message.content)}
      >
        {message.content}
      </article>
    </li>
  );
}
