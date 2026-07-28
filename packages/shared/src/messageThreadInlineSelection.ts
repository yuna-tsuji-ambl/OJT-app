import type { MessageThreadId } from './messageTypes.js';

export type MessageThreadSelection = MessageThreadId | null;

function isSameMessageThreadSelection(
  selectedThreadId: MessageThreadSelection,
  clickedThreadId: MessageThreadId,
): boolean {
  return selectedThreadId === clickedThreadId;
}

export function isInlineThreadDetailOpen(
  selectedThreadId: MessageThreadSelection,
): selectedThreadId is MessageThreadId {
  return selectedThreadId !== null;
}

export function shouldCloseInlineThreadSelection(
  selectedThreadId: MessageThreadSelection,
  clickedThreadId: MessageThreadId,
): boolean {
  return (
    isInlineThreadDetailOpen(selectedThreadId) &&
    isSameMessageThreadSelection(selectedThreadId, clickedThreadId)
  );
}

export function shouldSwitchInlineThreadSelection(
  selectedThreadId: MessageThreadSelection,
  clickedThreadId: MessageThreadId,
): boolean {
  return (
    isInlineThreadDetailOpen(selectedThreadId) &&
    !isSameMessageThreadSelection(selectedThreadId, clickedThreadId)
  );
}

export function resolveInlineThreadSelection(
  selectedThreadId: MessageThreadSelection,
  clickedThreadId: MessageThreadId,
): MessageThreadSelection {
  if (shouldCloseInlineThreadSelection(selectedThreadId, clickedThreadId)) {
    return null;
  }

  return clickedThreadId;
}
