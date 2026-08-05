import type { MessageBookmark } from '@ojt-app/shared';
import type { UserContext } from '../domain/types.js';
import {
  cascadeDeleteBookmarksForMessage,
  cascadeDeleteBookmarksForThread,
  createMessageBookmarkCommand,
  deleteMessageBookmarkCommand,
  listMessageBookmarksCommand,
  updateMessageBookmarkMemoCommand,
  type CreateMessageBookmarkInput,
  type MessageBookmarkDeps,
  type UpdateMessageBookmarkMemoInput,
} from './messageBookmarkCommands.js';

export function listMessageBookmarks(
  context: UserContext,
  targetType: MessageBookmark['targetType'] | undefined,
  deps: MessageBookmarkDeps,
): Promise<MessageBookmark[]> {
  return listMessageBookmarksCommand(context, targetType, deps);
}

export function createMessageBookmark(
  input: CreateMessageBookmarkInput,
  context: UserContext,
  deps: MessageBookmarkDeps,
): Promise<MessageBookmark> {
  return createMessageBookmarkCommand(input, context, deps);
}

export function deleteMessageBookmark(
  bookmarkId: string,
  context: UserContext,
  deps: MessageBookmarkDeps,
): Promise<void> {
  return deleteMessageBookmarkCommand(bookmarkId, context, deps);
}

export function updateMessageBookmarkMemo(
  bookmarkId: string,
  input: UpdateMessageBookmarkMemoInput,
  context: UserContext,
  deps: MessageBookmarkDeps,
): Promise<MessageBookmark> {
  return updateMessageBookmarkMemoCommand(bookmarkId, input, context, deps);
}

export { cascadeDeleteBookmarksForMessage, cascadeDeleteBookmarksForThread };
