import type { ReactNode } from 'react';
import {
  MESSAGE_SPLIT_EMPTY_DETAIL_TEXT,
  MESSAGE_SPLIT_RIGHT_PANE_LABEL,
  MESSAGE_SPLIT_VIEW_LABEL,
} from '../domain/messageThreadList';

interface MessageSplitViewProps {
  sendForm: ReactNode;
  threadList: ReactNode;
  detail: ReactNode | null;
}

export function MessageSplitView({
  sendForm,
  threadList,
  detail,
}: MessageSplitViewProps) {
  return (
    <div
      className="message-split-view"
      role="region"
      aria-label={MESSAGE_SPLIT_VIEW_LABEL}
    >
      <div className="message-split-view__left">
        <div className="message-split-view__composer">{sendForm}</div>
        <div className="message-split-view__thread-list">{threadList}</div>
      </div>
      <div
        className="message-split-view__right"
        role="region"
        aria-label={MESSAGE_SPLIT_RIGHT_PANE_LABEL}
      >
        {detail ?? (
          <p className="message-split-view__empty">
            {MESSAGE_SPLIT_EMPTY_DETAIL_TEXT}
          </p>
        )}
      </div>
    </div>
  );
}
