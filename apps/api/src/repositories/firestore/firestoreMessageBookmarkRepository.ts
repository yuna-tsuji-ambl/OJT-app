import type { Firestore } from '@google-cloud/firestore';
import type { MessageBookmark } from '@ojt-app/shared';
import { FIRESTORE_COLLECTIONS } from '../../firestore/collections.js';
import type { MessageBookmarkRepository } from '../messageBookmarkRepository.js';
import {
  fromMessageBookmarkDocument,
  toMessageBookmarkDocument,
} from './messageBookmarkFirestoreMappers.js';

export class FirestoreMessageBookmarkRepository implements MessageBookmarkRepository {
  constructor(private readonly db: Firestore) {}

  private collection() {
    return this.db.collection(FIRESTORE_COLLECTIONS.MESSAGE_BOOKMARKS);
  }

  async findByOwnerUserId(
    ownerUserId: string,
    targetType?: MessageBookmark['targetType'],
  ): Promise<MessageBookmark[]> {
    let query = this.collection().where('ownerUserId', '==', ownerUserId);
    if (targetType) {
      query = query.where('targetType', '==', targetType);
    }
    const snapshot = await query.get();
    return snapshot.docs.map((document) =>
      fromMessageBookmarkDocument(document.data()),
    );
  }

  async findById(bookmarkId: string): Promise<MessageBookmark | null> {
    const snapshot = await this.collection().doc(bookmarkId).get();
    if (!snapshot.exists) {
      return null;
    }
    return fromMessageBookmarkDocument(snapshot.data());
  }

  async save(bookmark: MessageBookmark): Promise<MessageBookmark> {
    const document = toMessageBookmarkDocument(bookmark);
    await this.collection().doc(bookmark.id).set(document);
    return fromMessageBookmarkDocument(document);
  }

  async delete(bookmarkId: string): Promise<void> {
    await this.collection().doc(bookmarkId).delete();
  }

  async deleteByThreadId(threadId: string): Promise<number> {
    const snapshot = await this.collection()
      .where('threadId', '==', threadId)
      .get();
    const batch = this.db.batch();
    for (const document of snapshot.docs) {
      batch.delete(document.ref);
    }
    if (snapshot.size > 0) {
      await batch.commit();
    }
    return snapshot.size;
  }

  async deleteByMessageId(messageId: string): Promise<number> {
    const snapshot = await this.collection()
      .where('messageId', '==', messageId)
      .get();
    const batch = this.db.batch();
    for (const document of snapshot.docs) {
      batch.delete(document.ref);
    }
    if (snapshot.size > 0) {
      await batch.commit();
    }
    return snapshot.size;
  }
}
