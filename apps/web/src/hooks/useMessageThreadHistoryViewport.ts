import { useLayoutEffect, useRef } from 'react';
import type { ThreadChatMessage } from '@ojt-app/shared';
import { scrollMessageThreadHistoryToBottom } from '../domain/messageThreadHistory';

export function useMessageThreadHistoryViewport(messages: ThreadChatMessage[]) {
  const historyRef = useRef<HTMLDivElement>(null);
  const latestMessageId = messages.at(-1)?.id ?? null;

  useLayoutEffect(() => {
    const historyElement = historyRef.current;

    if (!historyElement || latestMessageId === null) {
      return;
    }

    scrollMessageThreadHistoryToBottom(historyElement);
    const frameId = window.requestAnimationFrame(() => {
      scrollMessageThreadHistoryToBottom(historyElement);
    });
    return () => window.cancelAnimationFrame(frameId);
  }, [latestMessageId, messages.length]);

  return historyRef;
}
