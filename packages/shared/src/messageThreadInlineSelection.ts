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

/** @deprecated スプリットビューでは再クリック解除しない（常に false） */
export function shouldCloseInlineThreadSelection(
  _selectedThreadId: MessageThreadSelection,
  _clickedThreadId: MessageThreadId,
): boolean {
  return false;
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

/** 再クリックでも選択を維持する（BR-SV09） */
export function resolveInlineThreadSelection(
  _selectedThreadId: MessageThreadSelection,
  clickedThreadId: MessageThreadId,
): MessageThreadSelection {
  return clickedThreadId;
}
