import { sortThreadChatMessagesChronologically } from '../domain/messageThreadList.js';
import type { ThreadChatMessage } from '../domain/messageTypes.js';
import type { ThreadChatMessageStore } from './threadChatMessageStore.js';

export class InMemoryThreadChatMessageStore implements ThreadChatMessageStore {
  private readonly messages: ThreadChatMessage[] = [];

  async append(message: ThreadChatMessage): Promise<void> {
    this.messages.push({ ...message });
  }

  async listByThreadId(threadId: string): Promise<ThreadChatMessage[]> {
    const threadMessages = this.messages.filter(
      (message) => message.threadId === threadId,
    );

    return sortThreadChatMessagesChronologically(
      threadMessages.map((message) => ({ ...message })),
    );
  }
}
