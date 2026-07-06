import type { ChatMessage } from '../domain/chatTypes.js';
import type { ChatMessageStore } from './chatMessageStore.js';

export class InMemoryChatMessageStore implements ChatMessageStore {
  private readonly messages: ChatMessage[] = [];

  async append(message: ChatMessage): Promise<void> {
    this.messages.push({ ...message });
  }

  async listBetween(
    participantA: string,
    participantB: string,
  ): Promise<ChatMessage[]> {
    return this.messages
      .filter(
        (message) =>
          (message.senderId === participantA &&
            message.receiverId === participantB) ||
          (message.senderId === participantB &&
            message.receiverId === participantA),
      )
      .map((message) => ({ ...message }));
  }
}
