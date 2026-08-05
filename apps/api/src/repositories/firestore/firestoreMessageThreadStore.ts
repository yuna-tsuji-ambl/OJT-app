import type { Firestore } from '@google-cloud/firestore';
import { createMessageThread } from '../../domain/createMessageThread.js';
import type {
  CreateMessageThreadInput,
  MessageThread,
} from '../../domain/messageTypes.js';
import { FIRESTORE_COLLECTIONS } from '../../firestore/collections.js';
import type { MessageThreadStore } from '../messageThreadStore.js';
import {
  toMessageThread,
  toMessageThreadDocument,
  type MessageThreadDocument,
} from './messageFirestoreMappers.js';

export class FirestoreMessageThreadStore implements MessageThreadStore {
  constructor(private readonly db: Firestore) {}

  private threadsCollection() {
    return this.db.collection(FIRESTORE_COLLECTIONS.CHAT_THREADS);
  }

  async create(input: CreateMessageThreadInput): Promise<MessageThread> {
    const thread = createMessageThread(input);

    await this.threadsCollection()
      .doc(thread.id)
      .set(toMessageThreadDocument(thread));

    return thread;
  }

  async update(thread: MessageThread): Promise<MessageThread> {
    await this.threadsCollection()
      .doc(thread.id)
      .set(toMessageThreadDocument(thread));

    return thread;
  }

  async listByParticipants(
    traineeId: string,
    trainerId: string,
  ): Promise<MessageThread[]> {
    const snapshot = await this.threadsCollection()
      .where('traineeId', '==', traineeId)
      .where('trainerId', '==', trainerId)
      .get();

    return snapshot.docs.map((document) =>
      toMessageThread(document.id, document.data() as MessageThreadDocument),
    );
  }

  async getById(threadId: string): Promise<MessageThread | null> {
    const document = await this.threadsCollection().doc(threadId).get();

    if (!document.exists) {
      return null;
    }

    return toMessageThread(
      document.id,
      document.data() as MessageThreadDocument,
    );
  }
}
