import type { Firestore } from '@google-cloud/firestore';
import type { TrainerStatusType } from '../../domain/statusConstants.js';
import type { TrainerStatusRecord } from '../../domain/statusTypes.js';
import { FIRESTORE_COLLECTIONS } from '../../firestore/collections.js';
import type { TrainerStatusStore } from '../trainerStatusStore.js';

export class FirestoreTrainerStatusStore implements TrainerStatusStore {
  constructor(private readonly db: Firestore) {}

  private trainerStatusesCollection() {
    return this.db.collection(FIRESTORE_COLLECTIONS.TRAINER_STATUSES);
  }

  async getByUserId(userId: string): Promise<TrainerStatusRecord | null> {
    const document = await this.trainerStatusesCollection().doc(userId).get();
    return document.exists ? (document.data() as TrainerStatusRecord) : null;
  }

  async update(userId: string, status: TrainerStatusType): Promise<void> {
    const record: TrainerStatusRecord = { userId, status };
    await this.trainerStatusesCollection().doc(userId).set(record);
  }
}
