import type { ReactNode } from 'react';
import {
  isInlineMessageThreadRowSelected,
  type InlineMessageThreadDetailState,
  type MessageThreadListItem,
  type ThreadChatMessage,
} from '@ojt-app/shared';
import type { AuthUser } from '../auth/types';
import {
  MESSAGE_THREAD_LIST_EMPTY_TEXT,
  MESSAGE_THREAD_LIST_LABEL,
  MESSAGE_THREAD_LIST_NEXT_PAGE_LABEL,
} from '../domain/messageThreadList';
import { MessageThreadInlineDetailPanel } from './MessageThreadInlineDetailPanel';
import { MessageThreadListItemArticle } from './MessageThreadListItemArticle';

interface MessageThreadListProps {
  threads: MessageThreadListItem[];
  page: number;
  totalPages: number;
  onNextPage: () => void;
  inlineDetail: InlineMessageThreadDetailState;
  viewer: AuthUser;
  threadMessages: ThreadChatMessage[];
  historyError: string | null;
  inlineDetailActions?: ReactNode;
  onSelectThread?: (threadId: string) => void;
}

export function MessageThreadList({
  threads,
  page,
  totalPages,
  onNextPage,
  inlineDetail,
  viewer,
  threadMessages,
  historyError,
  inlineDetailActions = null,
  onSelectThread,
}: MessageThreadListProps) {
  const { selectedThreadId, inlineDetailThreadId, inlineDetailState } =
    inlineDetail;

  return (
    <>
      <div role="list" aria-label={MESSAGE_THREAD_LIST_LABEL}>
        {threads.length === 0 ? (
          <div role="listitem">{MESSAGE_THREAD_LIST_EMPTY_TEXT}</div>
        ) : (
          threads.flatMap((item) => {
            const threadId = item.thread.id;
            const isSelected = isInlineMessageThreadRowSelected(
              threadId,
              selectedThreadId,
              inlineDetailState,
            );
            const rowNodes: React.ReactNode[] = [
              <div role="listitem" key={threadId} data-thread-id={threadId}>
                <MessageThreadListItemArticle
                  item={item}
                  isSelected={isSelected}
                  onSelect={onSelectThread}
                />
              </div>,
            ];

            if (inlineDetailThreadId === threadId) {
              rowNodes.push(
                <MessageThreadInlineDetailPanel
                  key={`${threadId}-inline-detail`}
                  threadId={threadId}
                  state={inlineDetailState}
                  viewer={viewer}
                  messages={threadMessages}
                  historyError={historyError}
                >
                  {selectedThreadId === threadId ? inlineDetailActions : null}
                </MessageThreadInlineDetailPanel>,
              );
            }

            return rowNodes;
          })
        )}
      </div>
      {totalPages > page ? (
        <button type="button" onClick={onNextPage}>
          {MESSAGE_THREAD_LIST_NEXT_PAGE_LABEL}
        </button>
      ) : null}
    </>
  );
}
