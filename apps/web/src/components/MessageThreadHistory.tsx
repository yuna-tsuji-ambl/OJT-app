import type { ThreadChatMessage } from '@ojt-app/shared';
import { MESSAGE_THREAD_HISTORY_LOG_LABEL } from '../domain/messageThreadHistory';

interface MessageThreadHistoryProps {
  messages: ThreadChatMessage[];
}

export function MessageThreadHistory({ messages }: MessageThreadHistoryProps) {
  return (
    <div
      className="message-thread-history"
      role="log"
      aria-label={MESSAGE_THREAD_HISTORY_LOG_LABEL}
    >
      <ul className="message-thread-history-list">
        {messages.map((message) => (
          <li key={message.id}>
            <article className="message-thread-bubble">
              {message.content}
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
}
