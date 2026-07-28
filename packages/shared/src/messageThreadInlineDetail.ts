import {
  resolveInlineThreadSelection,
  type MessageThreadSelection,
} from './messageThreadInlineSelection.js';
import type { MessageThreadId } from './messageTypes.js';

export const MESSAGE_THREAD_INLINE_DETAIL_OPEN_STATE = 'open' as const;

export const MESSAGE_THREAD_INLINE_DETAIL_CLOSED_STATE = 'closed' as const;

export type MessageThreadInlineDetailVisibilityState =
  | typeof MESSAGE_THREAD_INLINE_DETAIL_OPEN_STATE
  | typeof MESSAGE_THREAD_INLINE_DETAIL_CLOSED_STATE;

export interface InlineMessageThreadDetailState {
  inlineDetailThreadId: MessageThreadSelection;
  inlineDetailState: MessageThreadInlineDetailVisibilityState;
  selectedThreadId: MessageThreadSelection;
}

export function createInitialInlineMessageThreadDetailState(): InlineMessageThreadDetailState {
  return {
    inlineDetailThreadId: null,
    inlineDetailState: MESSAGE_THREAD_INLINE_DETAIL_CLOSED_STATE,
    selectedThreadId: null,
  };
}

export function createOpenInlineMessageThreadDetailState(
  threadId: MessageThreadId,
): InlineMessageThreadDetailState {
  return {
    inlineDetailThreadId: threadId,
    inlineDetailState: MESSAGE_THREAD_INLINE_DETAIL_OPEN_STATE,
    selectedThreadId: threadId,
  };
}

export function resolveInlineMessageThreadDetailState(
  currentSelectedThreadId: MessageThreadSelection,
  clickedThreadId: MessageThreadId,
): InlineMessageThreadDetailState {
  const nextSelectedThreadId = resolveInlineThreadSelection(
    currentSelectedThreadId,
    clickedThreadId,
  );

  if (nextSelectedThreadId === null) {
    return {
      inlineDetailThreadId: clickedThreadId,
      inlineDetailState: MESSAGE_THREAD_INLINE_DETAIL_CLOSED_STATE,
      selectedThreadId: null,
    };
  }

  return createOpenInlineMessageThreadDetailState(clickedThreadId);
}

export function isInlineMessageThreadRowSelected(
  threadId: MessageThreadId,
  selectedThreadId: MessageThreadSelection,
  inlineDetailState: MessageThreadInlineDetailVisibilityState,
): boolean {
  return (
    selectedThreadId === threadId &&
    inlineDetailState === MESSAGE_THREAD_INLINE_DETAIL_OPEN_STATE
  );
}

export function shouldClearInlineMessageThreadDetailOnThreadCountIncrease(
  previousThreadCount: number,
  nextThreadCount: number,
  detailState: InlineMessageThreadDetailState,
): boolean {
  return (
    nextThreadCount > previousThreadCount &&
    detailState.selectedThreadId === null &&
    detailState.inlineDetailThreadId === null
  );
}
