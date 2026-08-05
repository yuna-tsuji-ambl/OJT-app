import type { ThreadChatMessage } from '../domain/messageTypes.js';

export interface ThreadChatMessageStore {
  append(message: ThreadChatMessage): Promise<void>;
  listByThreadId(threadId: string): Promise<ThreadChatMessage[]>;
}
