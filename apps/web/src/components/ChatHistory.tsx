import type { ChatMessage } from '../domain/statusTypes';

interface ChatHistoryProps {
  messages: ChatMessage[];
}

export function ChatHistory({ messages }: ChatHistoryProps) {
  return (
    <div role="log" aria-label="チャット履歴">
      {messages.map((message) => (
        <p key={`${message.senderId}-${message.type}-${message.content}`}>
          {message.content}
        </p>
      ))}
    </div>
  );
}
