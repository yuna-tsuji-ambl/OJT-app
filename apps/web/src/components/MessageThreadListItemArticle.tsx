import type { MessageThreadListItem } from '@ojt-app/shared';
import { formatThreadUpdatedAtDisplay } from '@ojt-app/shared';
import {
  MESSAGE_THREAD_LIST_PREVIEW_CLASS,
  MESSAGE_THREAD_LIST_SELECTED_CLASS,
  MESSAGE_THREAD_LIST_UPDATED_AT_CLASS,
} from '../domain/messageThreadList';

interface MessageThreadListItemArticleProps {
  item: MessageThreadListItem;
  isSelected?: boolean;
  onSelect?: (threadId: string) => void;
}

export function MessageThreadListItemArticle({
  item,
  isSelected = false,
  onSelect,
}: MessageThreadListItemArticleProps) {
  const { thread, firstMessage } = item;

  return (
    <article
      aria-label={firstMessage.content}
      aria-selected={isSelected ? 'true' : 'false'}
      className={isSelected ? MESSAGE_THREAD_LIST_SELECTED_CLASS : undefined}
      onClick={() => onSelect?.(thread.id)}
    >
      <p className={MESSAGE_THREAD_LIST_PREVIEW_CLASS}>
        {firstMessage.content}
      </p>
      <time
        className={MESSAGE_THREAD_LIST_UPDATED_AT_CLASS}
        dateTime={thread.updatedAt}
      >
        {formatThreadUpdatedAtDisplay(thread.updatedAt)}
      </time>
    </article>
  );
}
