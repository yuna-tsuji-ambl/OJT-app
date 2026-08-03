import {
  sendTrainerLegacyFlatReply,
  sendTrainerStampReply,
  sendTrainerTemplateMessage,
  sendTrainerTextMessage,
  sendTrainerTemplateReply,
  sendTrainerTextReply,
} from '../message.js';
import type { UserContext } from '../domain/types.js';
import type { MessageThreadStore } from '../repositories/messageThreadStore.js';
import type { ThreadChatMessageStore } from '../repositories/threadChatMessageStore.js';
import type {
  ReplyMessageBody,
  TrainerNewMessageBody,
  TrainerNewTextMessageBody,
  TrainerStampReplyBody,
  TrainerTextReplyBody,
  TrainerThreadReplyBody,
} from './messageRequestTypes.js';

export async function handleTrainerNewMessagePost(
  body: TrainerNewMessageBody,
  context: UserContext,
  threadStore: MessageThreadStore,
  threadChatMessageStore: ThreadChatMessageStore,
) {
  return sendTrainerTemplateMessage(
    {
      templateId: body.templateId,
      traineeId: body.traineeId,
    },
    context.userId,
    context.role,
    threadStore,
    threadChatMessageStore,
  );
}

export async function handleTrainerNewTextMessagePost(
  body: TrainerNewTextMessageBody,
  context: UserContext,
  threadStore: MessageThreadStore,
  threadChatMessageStore: ThreadChatMessageStore,
) {
  return sendTrainerTextMessage(
    {
      content: body.content,
      traineeId: body.traineeId,
    },
    context.userId,
    context.role,
    threadStore,
    threadChatMessageStore,
  );
}

export async function handleTrainerTemplateReplyPost(
  body: TrainerThreadReplyBody,
  context: UserContext,
  threadStore: MessageThreadStore,
  threadChatMessageStore: ThreadChatMessageStore,
) {
  return sendTrainerTemplateReply(
    {
      threadId: body.threadId,
      templateId: body.templateId,
    },
    context.userId,
    context.role,
    threadStore,
    threadChatMessageStore,
  );
}

export async function handleTrainerStampReplyPost(
  body: TrainerStampReplyBody,
  context: UserContext,
  threadStore: MessageThreadStore,
  threadChatMessageStore: ThreadChatMessageStore,
) {
  return sendTrainerStampReply(
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

export async function handleTrainerTextReplyPost(
  body: TrainerTextReplyBody,
  context: UserContext,
  threadStore: MessageThreadStore,
  threadChatMessageStore: ThreadChatMessageStore,
) {
  return sendTrainerTextReply(
    {
      threadId: body.threadId,
      content: body.content,
    },
    context.userId,
    context.role,
    threadStore,
    threadChatMessageStore,
  );
}

export async function handleTrainerLegacyFlatReplyPost(
  body: ReplyMessageBody,
  context: UserContext,
) {
  return sendTrainerLegacyFlatReply(
    {
      traineeId: body.traineeId,
      content: body.content,
    },
    context.userId,
    context.role,
  );
}
