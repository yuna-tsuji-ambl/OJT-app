import { ensureThreadParticipants } from '../domain/authorization.js';
import { MessageThreadNotFoundError } from '../domain/errors.js';
import type { MessageThread } from '../domain/messageTypes.js';
import type { MessageThreadStore } from '../repositories/messageThreadStore.js';

export async function requireMessageThread(
  threadStore: MessageThreadStore,
  threadId: string,
): Promise<MessageThread> {
  const thread = await threadStore.getById(threadId);

  if (!thread) {
    throw new MessageThreadNotFoundError(threadId);
  }

  return thread;
}

export async function requireParticipantThread(
  threadStore: MessageThreadStore,
  threadId: string,
  trainerId: string,
  traineeId: string,
): Promise<MessageThread> {
  const thread = await requireMessageThread(threadStore, threadId);
  ensureThreadParticipants(thread, trainerId, traineeId);

  return thread;
}
