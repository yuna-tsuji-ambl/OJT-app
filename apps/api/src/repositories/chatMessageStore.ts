import type { ChatMessage } from '../domain/chatTypes.js';

export interface ChatMessageStore {
  append(message: ChatMessage): Promise<void>;
}
