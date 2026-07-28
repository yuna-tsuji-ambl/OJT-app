import type { UserContext } from '../domain/types.js';
import type { MessageThreadStore } from '../repositories/messageThreadStore.js';
import type { ThreadChatMessageStore } from '../repositories/threadChatMessageStore.js';

export interface MessagePersistenceStores {
  threadStore: MessageThreadStore;
  messageStore: ThreadChatMessageStore;
}

export interface MessagePersistenceContext {
  context: UserContext;
  stores: MessagePersistenceStores;
}

export function createMessagePersistenceStores(
  threadStore: MessageThreadStore,
  messageStore: ThreadChatMessageStore,
): MessagePersistenceStores {
  return { threadStore, messageStore };
}

export function createMessagePersistenceContext(
  context: UserContext,
  threadStore: MessageThreadStore,
  messageStore: ThreadChatMessageStore,
): MessagePersistenceContext {
  return {
    context,
    stores: createMessagePersistenceStores(threadStore, messageStore),
  };
}
