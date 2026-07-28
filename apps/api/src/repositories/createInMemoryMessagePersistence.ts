import type { MessageThreadStore } from './messageThreadStore.js';
import type { ThreadChatMessageStore } from './threadChatMessageStore.js';
import { InMemoryMessageThreadStore } from './inMemoryMessageThreadStore.js';
import { InMemoryThreadChatMessageStore } from './inMemoryThreadChatMessageStore.js';

export interface MessagePersistence {
  threadStore: MessageThreadStore;
  messageStore: ThreadChatMessageStore;
}

export function createInMemoryMessagePersistence(): MessagePersistence {
  return {
    threadStore: new InMemoryMessageThreadStore(),
    messageStore: new InMemoryThreadChatMessageStore(),
  };
}
