import type { ChatMessageType } from './chatConstants.js';

export interface ChatMessage {
  senderId: string;
  receiverId: string;
  content: string;
  type: ChatMessageType;
}

export interface ChatMessageResult {
  message: ChatMessage;
}

export type QuickQuestionResult = ChatMessageResult;
export type QuickReplyResult = ChatMessageResult;
