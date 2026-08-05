import type { Firestore } from '@google-cloud/firestore';
import type { MessageAnnouncement } from '@ojt-app/shared';
import { FIRESTORE_COLLECTIONS } from '../../firestore/collections.js';
import type { MessageAnnouncementRepository } from '../messageAnnouncementRepository.js';
import {
  fromMessageAnnouncementDocument,
  toMessageAnnouncementDocument,
} from './messageAnnouncementFirestoreMappers.js';

export class FirestoreMessageAnnouncementRepository implements MessageAnnouncementRepository {
  constructor(private readonly db: Firestore) {}

  private collection() {
    return this.db.collection(FIRESTORE_COLLECTIONS.MESSAGE_ANNOUNCEMENTS);
  }

  async findAll(): Promise<MessageAnnouncement[]> {
    const snapshot = await this.collection().get();
    return snapshot.docs.map((document) =>
      fromMessageAnnouncementDocument(document.data()),
    );
  }

  async findById(announcementId: string): Promise<MessageAnnouncement | null> {
    const snapshot = await this.collection().doc(announcementId).get();
    if (!snapshot.exists) {
      return null;
    }
    return fromMessageAnnouncementDocument(snapshot.data());
  }

  async save(announcement: MessageAnnouncement): Promise<MessageAnnouncement> {
    const document = toMessageAnnouncementDocument(announcement);
    await this.collection().doc(announcement.id).set(document);
    return fromMessageAnnouncementDocument(document);
  }

  async delete(announcementId: string): Promise<void> {
    await this.collection().doc(announcementId).delete();
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
