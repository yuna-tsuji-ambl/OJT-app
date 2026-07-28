import type { ReactNode } from 'react';
import type {
  MessageThreadInlineDetailVisibilityState,
  ThreadChatMessage,
} from '@ojt-app/shared';
import type { AuthUser } from '../auth/types';
import { MessageThreadDetail } from './MessageThreadDetail';
import { MessageThreadHistory } from './MessageThreadHistory';

interface MessageThreadInlineDetailPanelProps {
  threadId: string;
  state: MessageThreadInlineDetailVisibilityState;
  viewer: AuthUser;
  messages: ThreadChatMessage[];
  historyError: string | null;
  children?: ReactNode;
}

export function MessageThreadInlineDetailPanel({
  threadId,
  state,
  viewer,
  messages,
  historyError,
  children,
}: MessageThreadInlineDetailPanelProps) {
  return (
    <MessageThreadDetail state={state} threadId={threadId}>
      {historyError ? <div role="alert">{historyError}</div> : null}
      {!historyError ? (
        <MessageThreadHistory messages={messages} viewer={viewer} />
      ) : null}
      {children}
    </MessageThreadDetail>
  );
}
