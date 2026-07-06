import type { TrainerStatusType } from './statusConstants';

export interface TrainerStatusRecord {
  userId: string;
  status: TrainerStatusType;
}

export interface ChatMessage {
  senderId: string;
  receiverId: string;
  content: string;
  type: 'question' | 'reply';
}

export interface ChatMessageResult {
  message: ChatMessage;
}
