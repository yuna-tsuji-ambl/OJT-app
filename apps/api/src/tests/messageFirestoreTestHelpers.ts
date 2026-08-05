import type { Firestore } from '@google-cloud/firestore';
import {
  QUESTION_TEMPLATE_TQ1_ID,
  sendTrainerStampReply,
  sendTraineeTemplateMessage,
  sendTraineeTextMessage,
  STAMP_ST1_ID,
  type MessageThreadListItem,
  type MessageThreadStore,
  type SendTemplateMessageResult,
  type SendTextMessageResult,
  type SendTrainerStampReplyResult,
  type ThreadChatMessageStore,
} from '../message.js';
import { getFirestore } from '../firestore/client.js';
import {
  createFirestoreMessagePersistence,
  type FirestoreMessagePersistence,
} from '../repositories/createFirestoreMessagePersistence.js';

export interface FirestoreMessageTestStores extends FirestoreMessagePersistence {
  db: Firestore;
}

export interface Im02ConversationResult {
  initialResult: SendTemplateMessageResult;
  replyResult: SendTrainerStampReplyResult;
}

export interface Im04TwoNewThreadsResult {
  firstResult: SendTemplateMessageResult;
  secondResult: SendTextMessageResult;
}

export function createFirestoreMessageTestStores(): FirestoreMessageTestStores {
  const db = getFirestore();

  return {
    db,
    ...createFirestoreMessagePersistence(db),
  };
}

export function findMessageThreadListItem(
  items: MessageThreadListItem[],
  threadId: string,
): MessageThreadListItem | undefined {
  return items.find((item) => item.thread.id === threadId);
}

export async function sendTraineeTq1NewThread(
  traineeId: string,
  trainerId: string,
  threadStore: MessageThreadStore,
  messageStore: ThreadChatMessageStore,
): Promise<SendTemplateMessageResult> {
  return sendTraineeTemplateMessage(
    {
      templateId: QUESTION_TEMPLATE_TQ1_ID,
      trainerId,
    },
    traineeId,
    'trainee',
    threadStore,
    messageStore,
  );
}

export async function sendIm02Conversation(
  traineeId: string,
  trainerId: string,
  threadStore: MessageThreadStore,
  messageStore: ThreadChatMessageStore,
): Promise<Im02ConversationResult> {
  const initialResult = await sendTraineeTq1NewThread(
    traineeId,
    trainerId,
    threadStore,
    messageStore,
  );

  const replyResult: SendTrainerStampReplyResult = await sendTrainerStampReply(
    {
      threadId: initialResult.thread.id,
      stampId: STAMP_ST1_ID,
    },
    trainerId,
    'trainer',
    threadStore,
    messageStore,
  );

  return { initialResult, replyResult };
}

export async function sendIm04TwoNewThreads(
  traineeId: string,
  trainerId: string,
  secondMessageContent: string,
  threadStore: MessageThreadStore,
  messageStore: ThreadChatMessageStore,
): Promise<Im04TwoNewThreadsResult> {
  const firstResult = await sendTraineeTq1NewThread(
    traineeId,
    trainerId,
    threadStore,
    messageStore,
  );
  const secondResult: SendTextMessageResult = await sendTraineeTextMessage(
    {
      trainerId,
      content: secondMessageContent,
    },
    traineeId,
    'trainee',
    threadStore,
    messageStore,
  );

  return { firstResult, secondResult };
}
