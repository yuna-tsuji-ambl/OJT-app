import type { Firestore } from '@google-cloud/firestore';
import { sortThreadChatMessagesChronologically } from '../../domain/messageThreadList.js';
import type { ThreadChatMessage } from '../../domain/messageTypes.js';
import { FIRESTORE_COLLECTIONS } from '../../firestore/collections.js';
import type { ThreadChatMessageStore } from '../threadChatMessageStore.js';
import {
  toThreadChatMessage,
  toThreadChatMessageDocument,
  type ThreadChatMessageDocument,
} from './messageFirestoreMappers.js';

export class FirestoreThreadChatMessageStore implements ThreadChatMessageStore {
  constructor(private readonly db: Firestore) {}

  private messagesCollection() {
    return this.db.collection(FIRESTORE_COLLECTIONS.THREAD_CHAT_MESSAGES);
  }

  async append(message: ThreadChatMessage): Promise<void> {
    await this.messagesCollection()
      .doc(message.id)
      .set(toThreadChatMessageDocument(message));
  }

  async listByThreadId(threadId: string): Promise<ThreadChatMessage[]> {
    const snapshot = await this.messagesCollection()
      .where('threadId', '==', threadId)
      .get();

    const messages = snapshot.docs.map((document) =>
      toThreadChatMessage(
        document.id,
        document.data() as ThreadChatMessageDocument,
      ),
    );

    return sortThreadChatMessagesChronologically(messages);
  }
}
