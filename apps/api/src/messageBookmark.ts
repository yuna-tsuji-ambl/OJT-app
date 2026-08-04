export {
  cascadeDeleteBookmarksForMessage,
  cascadeDeleteBookmarksForThread,
  createMessageBookmark,
  deleteMessageBookmark,
  listMessageBookmarks,
  updateMessageBookmarkMemo,
} from './messageBookmarks/messageBookmarkFacade.js';
export type {
  CreateMessageBookmarkInput,
  MessageBookmarkDeps,
  UpdateMessageBookmarkMemoInput,
} from './messageBookmarks/messageBookmarkCommands.js';
export type { MessageBookmarkRepository } from './repositories/messageBookmarkRepository.js';
