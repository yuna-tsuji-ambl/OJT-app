import type { UserContext } from '../domain/types.js';
import type { ChatMessageStore } from '../repositories/chatMessageStore.js';
import type { MessageThreadStore } from '../repositories/messageThreadStore.js';
import type { ThreadChatMessageStore } from '../repositories/threadChatMessageStore.js';
import {
  handleTrainerLegacyFlatReplyPost,
  handleTrainerNewMessagePost,
  handleTrainerStampReplyPost,
  handleTrainerTemplateReplyPost,
} from './handleTrainerThreadReplies.js';
import {
  parseReplyMessageBody,
  parseTrainerNewMessageBody,
  parseTrainerStampReplyBody,
  parseTrainerThreadReplyBody,
} from './messageRequestTypes.js';

export async function handleTrainerMessagePost(
  body: unknown,
  context: UserContext,
  threadStore: MessageThreadStore,
  threadChatMessageStore: ThreadChatMessageStore,
  _chatMessageStore: ChatMessageStore,
) {
  const templateReplyBody = parseTrainerThreadReplyBody(body);

  if (templateReplyBody) {
    return handleTrainerTemplateReplyPost(
      templateReplyBody,
      context,
      threadStore,
      threadChatMessageStore,
    );
  }

  const stampReplyBody = parseTrainerStampReplyBody(body);

  if (stampReplyBody) {
    return handleTrainerStampReplyPost(
      stampReplyBody,
      context,
      threadStore,
      threadChatMessageStore,
    );
  }

  const newMessageBody = parseTrainerNewMessageBody(body);

  if (newMessageBody) {
    return handleTrainerNewMessagePost(
      newMessageBody,
      context,
      threadStore,
      threadChatMessageStore,
    );
  }

  const legacyReplyBody = parseReplyMessageBody(body);

  if (!legacyReplyBody) {
    return null;
  }

  return handleTrainerLegacyFlatReplyPost(legacyReplyBody, context);
}
