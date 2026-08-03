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
}

export function MessageThreadDetailPane({
  threadId,
  viewer,
  messages,
  historyError,
  children,
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
            <MessageThreadHistory messages={messages} viewer={viewer} />
          ) : null}
        </div>
        {children ? (
          <div className="message-thread-detail-pane__composer">{children}</div>
        ) : null}
      </div>
    </MessageThreadDetail>
  );
}
