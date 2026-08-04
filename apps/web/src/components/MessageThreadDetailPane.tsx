import type { ReactNode } from 'react';
import {
  MESSAGE_THREAD_INLINE_DETAIL_OPEN_STATE,
  type ThreadChatMessage,
} from '@ojt-app/shared';
import type { AuthUser } from '../auth/types';
import { MessageThreadDetail } from './MessageThreadDetail';
import { MessageThreadHistory } from './MessageThreadHistory';

interface MessageThreadDetailPaneProps {
  threadId: string;
  viewer: AuthUser;
  messages: ThreadChatMessage[];
  historyError: string | null;
  children?: ReactNode;
  bookmarkedMessageIds?: ReadonlySet<string>;
  onToggleMessageBookmark?: (messageId: string) => void;
  announcedMessageIds?: ReadonlySet<string>;
  onToggleMessageAnnouncement?: (messageId: string) => void;
}

export function MessageThreadDetailPane({
  threadId,
  viewer,
  messages,
  historyError,
  children,
  bookmarkedMessageIds,
  onToggleMessageBookmark,
  announcedMessageIds,
  onToggleMessageAnnouncement,
}: MessageThreadDetailPaneProps) {
  return (
    <MessageThreadDetail
      state={MESSAGE_THREAD_INLINE_DETAIL_OPEN_STATE}
      threadId={threadId}
    >
      <div className="message-thread-detail-pane">
        <div className="message-thread-detail-pane__history">
          {historyError ? <div role="alert">{historyError}</div> : null}
          {!historyError ? (
            <MessageThreadHistory
              messages={messages}
              viewer={viewer}
              bookmarkedMessageIds={bookmarkedMessageIds}
              onToggleMessageBookmark={onToggleMessageBookmark}
              announcedMessageIds={announcedMessageIds}
              onToggleMessageAnnouncement={onToggleMessageAnnouncement}
            />
          ) : null}
        </div>
        {children ? (
          <div className="message-thread-detail-pane__composer">{children}</div>
        ) : null}
      </div>
    </MessageThreadDetail>
  );
}
