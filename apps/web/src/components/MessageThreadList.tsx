import type { MessageThreadListItem } from '@ojt-app/shared';

interface MessageThreadListProps {
  threads: MessageThreadListItem[];
  onSelectThread?: (threadId: string) => void;
}

export function MessageThreadList({
  threads,
  onSelectThread,
}: MessageThreadListProps) {
  return (
    <ul role="list" aria-label="メッセージスレッド一覧">
      {threads.length === 0 ? (
        <li>ルームはありません</li>
      ) : (
        threads.map((item) => (
          <li key={item.thread.id}>
            <article
              aria-label={item.firstMessage.content}
              onClick={() => onSelectThread?.(item.thread.id)}
            >
              {item.firstMessage.content}
            </article>
          </li>
        ))
      )}
    </ul>
  );
}
