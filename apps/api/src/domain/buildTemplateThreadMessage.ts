import { THREAD_MESSAGE_TYPE } from './messageConstants.js';
import { buildThreadChatMessage } from './buildThreadChatMessage.js';
import type { ThreadChatMessage } from './messageTypes.js';

export function buildTemplateThreadMessage(
  threadId: string,
  senderId: string,
  receiverId: string,
  templateId: string,
  resolveContent: (templateId: string) => string,
): ThreadChatMessage {
  return buildThreadChatMessage({
    threadId,
    senderId,
    receiverId,
    content: resolveContent(templateId),
    type: THREAD_MESSAGE_TYPE.TEMPLATE,
    templateId,
  });
}
