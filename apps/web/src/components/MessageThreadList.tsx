import {
  isInlineMessageThreadRowSelected,
  type InlineMessageThreadDetailState,
  type MessageThreadListItem,
} from '@ojt-app/shared';
import {
  MESSAGE_THREAD_LIST_EMPTY_TEXT,
  MESSAGE_THREAD_LIST_LABEL,
  MESSAGE_THREAD_LIST_NEXT_PAGE_LABEL,
} from '../domain/messageThreadList';
import { MessageThreadListItemArticle } from './MessageThreadListItemArticle';

interface MessageThreadListProps {
  threads: MessageThreadListItem[];
  page: number;
  totalPages: number;
  onNextPage: () => void;
  inlineDetail: InlineMessageThreadDetailState;
  onSelectThread?: (threadId: string) => void;
  bookmarkedThreadIds?: ReadonlySet<string>;
  onToggleThreadBookmark?: (threadId: string) => void;
}

export function MessageThreadList({
  threads,
  page,
  totalPages,
  onNextPage,
  inlineDetail,
  onSelectThread,
  bookmarkedThreadIds,
  onToggleThreadBookmark,
}: MessageThreadListProps) {
  const { selectedThreadId, inlineDetailState } = inlineDetail;

  return (
    <div className="message-thread-list">
      <div role="list" aria-label={MESSAGE_THREAD_LIST_LABEL}>
        {threads.length === 0 ? (
          <p className="message-thread-list-empty">
            {MESSAGE_THREAD_LIST_EMPTY_TEXT}
          </p>
        ) : (
          threads.map((item) => {
            const threadId = item.thread.id;
            const isSelected = isInlineMessageThreadRowSelected(
              threadId,
              selectedThreadId,
              inlineDetailState,
            );

            return (
              <div role="listitem" key={threadId} data-thread-id={threadId}>
                <MessageThreadListItemArticle
                  item={item}
                  isSelected={isSelected}
                  bookmarked={bookmarkedThreadIds?.has(threadId) ?? false}
                  onSelect={onSelectThread}
                  onToggleBookmark={onToggleThreadBookmark}
                />
              </div>
            );
          })
        )}
      </div>
      {totalPages > page ? (
        <button
          type="button"
          className="message-thread-list__next"
          onClick={onNextPage}
        >
          {MESSAGE_THREAD_LIST_NEXT_PAGE_LABEL}
        </button>
      ) : null}
    </div>
  );
}
