import {
  ensureConversationParticipant,
  ensureTrainee,
  ensureTrainer,
} from '../domain/authorization.js';
import type {
  MessageThread,
  SendMessageResult,
  ThreadMessageBuilder,
} from '../domain/messageTypes.js';
import { appendMessageToThread } from './messageDelivery.js';
import type { MessagePersistenceContext } from './messagePersistenceStores.js';
import { requireMessageThread } from './messageThreadLoader.js';

type ThreadReplySender = 'trainee' | 'trainer';

function ensureThreadReplySender(
  operation: MessagePersistenceContext,
  sender: ThreadReplySender,
): void {
  if (sender === 'trainee') {
    ensureTrainee(operation.context);
    return;
  }

  ensureTrainer(operation.context);
}

function resolveThreadReplyParticipants(
  thread: MessageThread,
  sender: ThreadReplySender,
): { senderId: string; receiverId: string } {
  if (sender === 'trainee') {
    return {
      senderId: thread.traineeId,
      receiverId: thread.trainerId,
    };
  }

  return {
    senderId: thread.trainerId,
    receiverId: thread.traineeId,
  };
}

export async function deliverThreadReply(
  threadId: string,
  operation: MessagePersistenceContext,
  sender: ThreadReplySender,
  buildMessage: ThreadMessageBuilder,
): Promise<SendMessageResult> {
  ensureThreadReplySender(operation, sender);

  const thread = await requireMessageThread(
    operation.stores.threadStore,
    threadId,
  );
  ensureConversationParticipant(
    operation.context,
    thread.trainerId,
    thread.traineeId,
  );

  const { senderId, receiverId } = resolveThreadReplyParticipants(
    thread,
    sender,
  );

  return appendMessageToThread(
    operation.stores.messageStore,
    thread,
    senderId,
    receiverId,
    buildMessage,
  );
}
