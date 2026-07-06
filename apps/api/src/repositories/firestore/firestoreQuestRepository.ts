import type { Firestore } from '@google-cloud/firestore';
import { QUEST_STATUS } from '../../domain/constants.js';
import type { Quest } from '../../domain/types.js';
import { FIRESTORE_COLLECTIONS } from '../../firestore/collections.js';
import type { QuestStore } from '../questStore.js';
import type { SheetRepository } from '../sheetRepository.js';

export class FirestoreQuestRepository implements QuestStore, SheetRepository {
  constructor(private readonly db: Firestore) {}

  private questsCollection() {
    return this.db.collection(FIRESTORE_COLLECTIONS.QUESTS);
  }

  async loadQuests(_assigneeId: string): Promise<Quest[]> {
    const snapshot = await this.questsCollection().get();
    return snapshot.docs.map((document) => document.data() as Quest);
  }

  async getById(id: string): Promise<Quest | null> {
    const document = await this.questsCollection().doc(id).get();
    return document.exists ? (document.data() as Quest) : null;
  }

  async update(quest: Quest): Promise<void> {
    await this.questsCollection().doc(quest.id).set(quest);
  }

  async getPendingQuests(): Promise<Quest[]> {
    const snapshot = await this.questsCollection()
      .where('status', '==', QUEST_STATUS.PENDING)
      .get();

    return snapshot.docs.map((document) => document.data() as Quest);
  }

  async updateOnApproval(quest: Quest): Promise<void> {
    await this.update(quest);
  }
}
