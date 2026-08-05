import type { ThreadMessageType } from './messageConstants.js';
import type { ThreadChatMessage } from './messageTypes.js';

interface BuildThreadChatMessageInput {
  threadId: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: ThreadMessageType;
  templateId?: string;
  stampId?: string;
}

export function buildThreadChatMessage(
  input: BuildThreadChatMessageInput,
): ThreadChatMessage {
  return {
    id: crypto.randomUUID(),
    threadId: input.threadId,
    senderId: input.senderId,
    receiverId: input.receiverId,
    content: input.content,
    type: input.type,
    templateId: input.templateId,
    stampId: input.stampId,
    createdAt: new Date().toISOString(),
  };
}
