import {
  resolveInlineThreadSelection,
  type MessageThreadSelection,
} from './messageThreadInlineSelection.js';
import type { MessageThreadId } from './messageTypes.js';
import type { UserContext } from './types.js';

export type ReloadMessageThreadHistory = (
  authUser: UserContext,
  threadId: MessageThreadId,
) => Promise<unknown>;

export type SetMessageThreadSelection = (
  selection: MessageThreadSelection,
) => void;

function canReloadMessageThreadHistory(
  authUser: UserContext | null,
): authUser is UserContext {
  return authUser !== null;
}

async function commitMessageThreadSelection(
  nextSelection: MessageThreadSelection,
  authUser: UserContext | null,
  setSelectedThreadId: SetMessageThreadSelection,
  reloadThreadHistory: ReloadMessageThreadHistory,
): Promise<MessageThreadSelection> {
  setSelectedThreadId(nextSelection);

  if (nextSelection !== null && canReloadMessageThreadHistory(authUser)) {
    await reloadThreadHistory(authUser, nextSelection);
  }

  return nextSelection;
}

export async function applyMessageThreadSelection(
  threadId: MessageThreadId,
  authUser: UserContext | null,
  setSelectedThreadId: SetMessageThreadSelection,
  reloadThreadHistory: ReloadMessageThreadHistory,
): Promise<void> {
  await commitMessageThreadSelection(
    threadId,
    authUser,
    setSelectedThreadId,
    reloadThreadHistory,
  );
}

export async function selectInlineMessageThread(
  clickedThreadId: MessageThreadId,
  selectedThreadId: MessageThreadSelection,
  authUser: UserContext | null,
  setSelectedThreadId: SetMessageThreadSelection,
  reloadThreadHistory: ReloadMessageThreadHistory,
): Promise<MessageThreadSelection> {
  const nextSelection = resolveInlineThreadSelection(
    selectedThreadId,
    clickedThreadId,
  );

  return commitMessageThreadSelection(
    nextSelection,
    authUser,
    setSelectedThreadId,
    reloadThreadHistory,
  );
}
