import type { ThreadMessageType } from './messageConstants.js';
import { buildThreadChatMessage } from './buildThreadChatMessage.js';
import type { ThreadChatMessage } from './messageTypes.js';

export function buildContentThreadMessage(
  threadId: string,
  senderId: string,
  receiverId: string,
  content: string,
  type: ThreadMessageType,
): ThreadChatMessage {
  return buildThreadChatMessage({
    threadId,
    senderId,
    receiverId,
    content,
    type,
  });
}
