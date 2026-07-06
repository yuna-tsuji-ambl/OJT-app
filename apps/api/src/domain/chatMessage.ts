import { CHAT_MESSAGE_TYPE } from './chatConstants.js';
import type { ChatMessageType } from './chatConstants.js';
import type {
  ChatMessage,
  ChatMessageResult,
  QuickQuestionResult,
  QuickReplyResult,
} from './chatTypes.js';

function createChatMessage(
  senderId: string,
  receiverId: string,
  content: string,
  type: ChatMessageType,
): ChatMessage {
  return { senderId, receiverId, content, type };
}

export function createChatMessageResult(
  message: ChatMessage,
): ChatMessageResult {
  return { message };
}

export function buildQuickQuestion(
  senderId: string,
  receiverId: string,
  content: string,
): QuickQuestionResult {
  return createChatMessageResult(
    createChatMessage(senderId, receiverId, content, CHAT_MESSAGE_TYPE.QUESTION),
  );
}

export function buildQuickReply(
  senderId: string,
  receiverId: string,
  content: string,
): QuickReplyResult {
  return createChatMessageResult(
    createChatMessage(senderId, receiverId, content, CHAT_MESSAGE_TYPE.REPLY),
  );
}
