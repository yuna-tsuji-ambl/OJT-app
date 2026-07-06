import type { Firestore } from '@google-cloud/firestore';
import type {
  ConditionDraft,
  ConditionHistoryRecord,
} from '../../domain/conditionTypes.js';
import { FIRESTORE_COLLECTIONS } from '../../firestore/collections.js';
import type { ConditionRecordStore } from '../conditionRecordStore.js';

interface ConditionRecordDocument extends ConditionHistoryRecord {
  traineeId: string;
}

export class FirestoreConditionRecordStore implements ConditionRecordStore {
  constructor(private readonly db: Firestore) {}

  private conditionRecordsCollection() {
    return this.db.collection(FIRESTORE_COLLECTIONS.CONDITION_RECORDS);
  }

  async save(userId: string, record: ConditionDraft): Promise<void> {
    const historyRecord: ConditionRecordDocument = {
      traineeId: userId,
      ...record,
      recordedAt: new Date().toISOString().slice(0, 10),
    };

    await this.conditionRecordsCollection().add(historyRecord);
  }

  async findHistoryByTraineeId(
    traineeId: string,
  ): Promise<ConditionHistoryRecord[]> {
    const snapshot = await this.conditionRecordsCollection()
      .where('traineeId', '==', traineeId)
      .orderBy('recordedAt')
      .get();

    return snapshot.docs.map((document) => {
      const data = document.data() as ConditionRecordDocument;
      return {
        workload: data.workload,
        comprehension: data.comprehension,
        mental: data.mental,
        recordedAt: data.recordedAt,
      };
    });
  }
}
