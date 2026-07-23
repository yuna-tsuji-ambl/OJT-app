import type {
  CreateMessageThreadInput,
  MessageThread,
} from './messageTypes.js';
import type { MessageThreadStore } from '../repositories/messageThreadStore.js';

export async function persistNewMessageThread(
  threadStore: MessageThreadStore,
  input: CreateMessageThreadInput,
): Promise<MessageThread> {
  return threadStore.create(input);
}
