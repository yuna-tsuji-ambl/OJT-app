import type { ChatMessage } from '../domain/chatTypes.js';

export interface ChatMessageStore {
  append(message: ChatMessage): Promise<void>;
  listBetween(participantA: string, participantB: string): Promise<ChatMessage[]>;
}
