import { resolveReplyTemplateContent } from './replyTemplateConstants.js';
import { resolveStampContent } from './stampConstants.js';
import { buildTemplateThreadMessage } from './buildTemplateThreadMessage.js';
import { buildTextThreadMessage } from './buildTextThreadMessage.js';
import { buildStampThreadMessage } from './buildStampThreadMessage.js';
import type { ThreadChatMessage } from './messageTypes.js';

export function buildTrainerTemplateMessage(
  threadId: string,
  senderId: string,
  receiverId: string,
  templateId: string,
): ThreadChatMessage {
  return buildTemplateThreadMessage(
    threadId,
    senderId,
    receiverId,
    templateId,
    resolveReplyTemplateContent,
  );
}

export function buildTrainerTextMessage(
  threadId: string,
  senderId: string,
  receiverId: string,
  content: string,
): ThreadChatMessage {
  return buildTextThreadMessage(threadId, senderId, receiverId, content);
}

export function buildTrainerStampMessage(
  threadId: string,
  senderId: string,
  receiverId: string,
  stampId: string,
): ThreadChatMessage {
  return buildStampThreadMessage(
    threadId,
    senderId,
    receiverId,
    stampId,
    resolveStampContent(stampId),
  );
}
