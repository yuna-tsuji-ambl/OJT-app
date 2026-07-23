import { THREAD_MESSAGE_TYPE } from './messageConstants.js';
import { buildThreadChatMessage } from './buildThreadChatMessage.js';
import type { ThreadChatMessage } from './messageTypes.js';

export function buildStampThreadMessage(
  threadId: string,
  senderId: string,
  receiverId: string,
  stampId: string,
  content: string,
): ThreadChatMessage {
  return buildThreadChatMessage({
    threadId,
    senderId,
    receiverId,
    content,
    type: THREAD_MESSAGE_TYPE.STAMP,
    stampId,
  });
}
