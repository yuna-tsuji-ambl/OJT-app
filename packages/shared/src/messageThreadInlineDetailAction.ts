import {
  resolveInlineMessageThreadDetailState,
  type InlineMessageThreadDetailState,
} from './messageThreadInlineDetail.js';
import type { MessageThreadSelection } from './messageThreadInlineSelection.js';
import type { MessageThreadId } from './messageTypes.js';

export type ApplyInlineMessageThreadDetailState = (
  state: InlineMessageThreadDetailState,
) => void;

export function applyInlineMessageThreadDetailSelection(
  clickedThreadId: MessageThreadId,
  currentSelectedThreadId: MessageThreadSelection,
  applyDetailState: ApplyInlineMessageThreadDetailState,
): InlineMessageThreadDetailState {
  const nextState = resolveInlineMessageThreadDetailState(
    currentSelectedThreadId,
    clickedThreadId,
  );

  applyDetailState(nextState);

  return nextState;
}
