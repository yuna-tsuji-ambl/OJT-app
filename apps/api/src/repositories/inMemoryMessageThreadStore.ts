import { createMessageThread } from '../domain/createMessageThread.js';
import type {
  CreateMessageThreadInput,
  MessageThread,
} from '../domain/messageTypes.js';
import type { MessageThreadStore } from './messageThreadStore.js';

export class InMemoryMessageThreadStore implements MessageThreadStore {
  private readonly threads = new Map<string, MessageThread>();

  async create(input: CreateMessageThreadInput): Promise<MessageThread> {
    const thread = createMessageThread(input);
    this.threads.set(thread.id, { ...thread });
    return thread;
  }

  async listByParticipants(
    traineeId: string,
    trainerId: string,
  ): Promise<MessageThread[]> {
    return [...this.threads.values()].filter(
      (thread) =>
        thread.traineeId === traineeId && thread.trainerId === trainerId,
    );
  }

  async getById(threadId: string): Promise<MessageThread | null> {
    const thread = this.threads.get(threadId);
    return thread ? { ...thread } : null;
  }
}
