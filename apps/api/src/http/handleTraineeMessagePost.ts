import {
  sendTraineeStampReply,
  sendTraineeTemplateMessage,
  sendTraineeTemplateReply,
  sendTraineeTextMessage,
  sendTraineeTextReply,
} from '../message.js';
import type { UserContext } from '../domain/types.js';
import type { MessageThreadStore } from '../repositories/messageThreadStore.js';
import type { ThreadChatMessageStore } from '../repositories/threadChatMessageStore.js';
import type { QuestionMessageBody } from './messageRequestTypes.js';

export async function handleTraineeMessagePost(
  body: QuestionMessageBody,
  context: UserContext,
  threadStore: MessageThreadStore,
  threadChatMessageStore: ThreadChatMessageStore,
) {
  if (body.threadId && body.stampId) {
    return sendTraineeStampReply(
      {
        threadId: body.threadId,
        stampId: body.stampId,
      },
      context.userId,
      context.role,
      threadStore,
      threadChatMessageStore,
    );
  }

  if (body.threadId && body.templateId) {
    return sendTraineeTemplateReply(
      {
        threadId: body.threadId,
        templateId: body.templateId,
        trainerId: body.trainerId,
      },
      context.userId,
      context.role,
      threadStore,
      threadChatMessageStore,
    );
  }

  if (body.threadId && body.content) {
    return sendTraineeTextReply(
      {
        threadId: body.threadId,
        content: body.content,
        trainerId: body.trainerId,
      },
      context.userId,
      context.role,
      threadStore,
      threadChatMessageStore,
    );
  }

  if (body.templateId) {
    return sendTraineeTemplateMessage(
      {
        templateId: body.templateId,
        trainerId: body.trainerId,
      },
      context.userId,
      context.role,
      threadStore,
      threadChatMessageStore,
    );
  }

  if (body.content) {
    return sendTraineeTextMessage(
      {
        content: body.content,
        trainerId: body.trainerId,
      },
      context.userId,
      context.role,
      threadStore,
      threadChatMessageStore,
    );
  }

  return null;
}
