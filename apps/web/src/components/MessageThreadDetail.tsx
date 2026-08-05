import type { ReactNode } from 'react';
import {
  MESSAGE_THREAD_INLINE_DETAIL_OPEN_STATE,
  type MessageThreadInlineDetailVisibilityState,
} from '@ojt-app/shared';
import { MESSAGE_THREAD_DETAIL_REGION_LABEL } from '../domain/messageTrainerForm';

interface MessageThreadDetailProps {
  children: ReactNode;
  state?: MessageThreadInlineDetailVisibilityState;
  threadId?: string;
}

export function MessageThreadDetail({
  children,
  state = MESSAGE_THREAD_INLINE_DETAIL_OPEN_STATE,
  threadId,
}: MessageThreadDetailProps) {
  return (
    <section
      className="message-thread-detail"
      role="region"
      aria-label={MESSAGE_THREAD_DETAIL_REGION_LABEL}
      data-state={state}
      data-thread-id={threadId}
      aria-hidden={state === 'closed'}
    >
      {children}
    </section>
  );
}
