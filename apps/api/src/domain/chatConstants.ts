export const CHAT_MESSAGE_TYPE = {
  QUESTION: 'question',
  REPLY: 'reply',
} as const;

export type ChatMessageType =
  (typeof CHAT_MESSAGE_TYPE)[keyof typeof CHAT_MESSAGE_TYPE];
