import type { ThreadMessageType } from './messageConstants.js';

export interface MessageThread {
  id: string;
  traineeId: string;
  trainerId: string;
  createdAt: string;
  updatedAt: string;
}

export type MessageThreadId = MessageThread['id'];

export interface ThreadChatMessage {
  id: string;
  threadId: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: ThreadMessageType;
  templateId?: string;
  stampId?: string;
  createdAt: string;
}

export interface MessageThreadListItem {
  thread: MessageThread;
  firstMessage: ThreadChatMessage;
}

export interface SendMessageResult {
  thread: MessageThread;
  message: ThreadChatMessage;
}

export type SendTemplateMessageResult = SendMessageResult;
