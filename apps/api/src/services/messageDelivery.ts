import { persistNewMessageThread } from '../domain/persistNewMessageThread.js';
import { selectMissedThreadChatMessages } from '../domain/messageRealtimeSync.js';
import type {
  MessageThread,
  SendMessageResult,
  ThreadChatMessage,
  ThreadMessageBuilder,
} from '../domain/messageTypes.js';
import { createSendMessageResult } from '../domain/sendMessageResult.js';
import type { MessageThreadStore } from '../repositories/messageThreadStore.js';
import type { ThreadChatMessageStore } from '../repositories/threadChatMessageStore.js';
import type { MessagePersistenceStores } from './messagePersistenceStores.js';
import { requireParticipantThread } from './messageThreadLoader.js';

interface NewThreadParticipants {
  traineeId: string;
  trainerId: string;
  senderId: string;
  receiverId: string;
}

type NewThreadSender = 'trainee' | 'trainer';

async function createMessageThread(
  threadStore: MessageThreadStore,
  traineeId: string,
  trainerId: string,
): Promise<MessageThread> {
  return persistNewMessageThread(threadStore, { traineeId, trainerId });
}

async function deliverThreadChatMessage(
  messageStore: ThreadChatMessageStore,
  result: SendMessageResult,
): Promise<SendMessageResult> {
  await messageStore.append(result.message);
  return result;
}

export async function appendMessageToThread(
  messageStore: ThreadChatMessageStore,
  thread: MessageThread,
  senderId: string,
  receiverId: string,
  buildMessage: ThreadMessageBuilder,
): Promise<SendMessageResult> {
  const message = buildMessage(thread.id, senderId, receiverId);

  return deliverThreadChatMessage(
    messageStore,
    createSendMessageResult(thread, message),
  );
}

function resolveNewThreadParticipants(
  traineeId: string,
  trainerId: string,
  sender: NewThreadSender,
): NewThreadParticipants {
  const senderId = sender === 'trainee' ? traineeId : trainerId;
  const receiverId = sender === 'trainee' ? trainerId : traineeId;

  return { traineeId, trainerId, senderId, receiverId };
}

async function sendNewThreadMessage(
  participants: NewThreadParticipants,
  stores: MessagePersistenceStores,
  buildMessage: ThreadMessageBuilder,
): Promise<SendMessageResult> {
  const { traineeId, trainerId, senderId, receiverId } = participants;
  const thread = await createMessageThread(
    stores.threadStore,
    traineeId,
    trainerId,
  );

  return appendMessageToThread(
    stores.messageStore,
    thread,
    senderId,
    receiverId,
    buildMessage,
  );
}

export async function sendTraineeNewThreadMessage(
  trainerId: string,
  traineeId: string,
  stores: MessagePersistenceStores,
  buildMessage: ThreadMessageBuilder,
): Promise<SendMessageResult> {
  return sendNewThreadMessage(
    resolveNewThreadParticipants(traineeId, trainerId, 'trainee'),
    stores,
    buildMessage,
  );
}

export async function sendTrainerNewThreadMessage(
  traineeId: string,
  trainerId: string,
  stores: MessagePersistenceStores,
  buildMessage: ThreadMessageBuilder,
): Promise<SendMessageResult> {
  return sendNewThreadMessage(
    resolveNewThreadParticipants(traineeId, trainerId, 'trainer'),
    stores,
    buildMessage,
  );
}

export async function listMissedThreadChatMessagesForThread(
  trainerId: string,
  traineeId: string,
  threadId: string,
  lastSeenMessageId: string,
  stores: MessagePersistenceStores,
): Promise<{ thread: MessageThread; messages: ThreadChatMessage[] }> {
  const thread = await requireParticipantThread(
    stores.threadStore,
    threadId,
    trainerId,
    traineeId,
  );
  const messages = await stores.messageStore.listByThreadId(threadId);

  return {
    thread,
    messages: selectMissedThreadChatMessages(messages, lastSeenMessageId),
  };
}
