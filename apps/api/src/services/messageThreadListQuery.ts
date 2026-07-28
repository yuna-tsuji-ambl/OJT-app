import { sortMessageThreadsByLatestActivity } from '@ojt-app/shared';
import { ensureConversationParticipant } from '../domain/authorization.js';
import { listMessageThreadListItems } from '../domain/messageThreadList.js';
import type { MessageThreadListItem } from '../domain/messageTypes.js';
import type { MessagePersistenceContext } from './messagePersistenceStores.js';

export async function listMessageThreadsForHome(
  trainerId: string,
  traineeId: string,
  operation: MessagePersistenceContext,
): Promise<MessageThreadListItem[]> {
  ensureConversationParticipant(operation.context, trainerId, traineeId);

  const threads = sortMessageThreadsByLatestActivity(
    await operation.stores.threadStore.listByParticipants(traineeId, trainerId),
  );

  return listMessageThreadListItems(threads, (threadId) =>
    operation.stores.messageStore.listByThreadId(threadId),
  );
}
