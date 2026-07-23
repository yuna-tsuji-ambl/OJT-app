import type {
  CreateMessageThreadInput,
  MessageThread,
} from '../domain/messageTypes.js';

export interface MessageThreadStore {
  create(input: CreateMessageThreadInput): Promise<MessageThread>;
  listByParticipants(
    traineeId: string,
    trainerId: string,
  ): Promise<MessageThread[]>;
  getById(threadId: string): Promise<MessageThread | null>;
}
