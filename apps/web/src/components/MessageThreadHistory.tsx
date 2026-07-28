import type { ThreadChatMessage } from '@ojt-app/shared';
import type { AuthUser } from '../auth/types';
import { MESSAGE_THREAD_HISTORY_LOG_LABEL } from '../domain/messageThreadHistory';
import { resolveMessageSenderDisplay } from '../domain/messageThreadSenderDisplay';
import { useMessageThreadHistoryViewport } from '../hooks/useMessageThreadHistoryViewport';
import { MessageThreadBubble } from './MessageThreadBubble';

interface MessageThreadHistoryProps {
  messages: ThreadChatMessage[];
  viewer: AuthUser;
}

export function MessageThreadHistory({
  messages,
  viewer,
}: MessageThreadHistoryProps) {
  const historyRef = useMessageThreadHistoryViewport(messages);

  return (
    <div
      ref={historyRef}
      className="message-thread-history"
      role="log"
      aria-label={MESSAGE_THREAD_HISTORY_LOG_LABEL}
    >
      <ul className="message-thread-history-list">
        {messages.map((message) => (
          <MessageThreadBubble
            key={message.id}
            message={message}
            display={resolveMessageSenderDisplay(message.senderId, viewer)}
          />
        ))}
      </ul>
    </div>
  );
}
