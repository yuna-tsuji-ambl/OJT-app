import { THREAD_MESSAGE_TYPE } from './messageConstants.js';
import { buildContentThreadMessage } from './buildContentThreadMessage.js';
import type { ThreadChatMessage } from './messageTypes.js';

export function buildTextThreadMessage(
  threadId: string,
  senderId: string,
  receiverId: string,
  content: string,
): ThreadChatMessage {
  return buildContentThreadMessage(
    threadId,
    senderId,
    receiverId,
    content,
    THREAD_MESSAGE_TYPE.TEXT,
  );
}
