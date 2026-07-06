import type { Firestore } from '@google-cloud/firestore';
import type { ChatMessage } from '../../domain/chatTypes.js';
import { buildConversationKey } from '../../firestore/conversationKey.js';
import { FIRESTORE_COLLECTIONS } from '../../firestore/collections.js';
import type { ChatMessageStore } from '../chatMessageStore.js';

interface ChatMessageDocument extends ChatMessage {
  conversationKey: string;
  createdAt: string;
}

export class FirestoreChatMessageStore implements ChatMessageStore {
  constructor(private readonly db: Firestore) {}

  private chatMessagesCollection() {
    return this.db.collection(FIRESTORE_COLLECTIONS.CHAT_MESSAGES);
  }

  async append(message: ChatMessage): Promise<void> {
    const document: ChatMessageDocument = {
      ...message,
      conversationKey: buildConversationKey(message.senderId, message.receiverId),
      createdAt: new Date().toISOString(),
    };

    await this.chatMessagesCollection().add(document);
  }

  async listBetween(
    participantA: string,
    participantB: string,
  ): Promise<ChatMessage[]> {
    const conversationKey = buildConversationKey(participantA, participantB);
    const snapshot = await this.chatMessagesCollection()
      .where('conversationKey', '==', conversationKey)
      .orderBy('createdAt')
      .get();

    return snapshot.docs.map((document) => {
      const data = document.data() as ChatMessageDocument;
      return {
        senderId: data.senderId,
        receiverId: data.receiverId,
        content: data.content,
        type: data.type,
      };
    });
  }
}
