import { ensureConversationParticipant } from '../domain/authorization.js';
import { sortThreadChatMessagesChronologically } from '../domain/messageThreadList.js';
import type { ThreadChatMessage } from '../domain/messageTypes.js';
import type { MessagePersistenceContext } from './messagePersistenceStores.js';
import { requireParticipantThread } from './messageThreadLoader.js';

export async function listThreadChatMessagesForRoom(
  trainerId: string,
  traineeId: string,
  threadId: string,
  operation: MessagePersistenceContext,
): Promise<ThreadChatMessage[]> {
  ensureConversationParticipant(operation.context, trainerId, traineeId);

  await requireParticipantThread(
    operation.stores.threadStore,
    threadId,
    trainerId,
    traineeId,
  );

  const messages = await operation.stores.messageStore.listByThreadId(threadId);

  return sortThreadChatMessagesChronologically(messages);
}
