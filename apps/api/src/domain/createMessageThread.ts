import type {
  CreateMessageThreadInput,
  MessageThread,
} from './messageTypes.js';

export function createMessageThread(
  input: CreateMessageThreadInput,
): MessageThread {
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    traineeId: input.traineeId,
    trainerId: input.trainerId,
    createdAt: now,
    updatedAt: now,
  };
}
