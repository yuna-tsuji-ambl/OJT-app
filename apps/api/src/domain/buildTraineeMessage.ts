import { resolveQuestionTemplateContent } from './messageConstants.js';
import { buildTemplateThreadMessage } from './buildTemplateThreadMessage.js';
import { buildTextThreadMessage } from './buildTextThreadMessage.js';
import { buildStampThreadMessage } from './buildStampThreadMessage.js';
import { resolveTraineeStampContent } from './traineeStampConstants.js';
import type { ThreadChatMessage } from './messageTypes.js';

export function buildTraineeTemplateMessage(
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
    resolveQuestionTemplateContent,
  );
}

export function buildTraineeTextMessage(
  threadId: string,
  senderId: string,
  receiverId: string,
  content: string,
): ThreadChatMessage {
  return buildTextThreadMessage(threadId, senderId, receiverId, content);
}

export function buildTraineeStampMessage(
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
    resolveTraineeStampContent(stampId),
  );
}
