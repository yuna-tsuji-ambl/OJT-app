import type {
  ConditionDraft,
  ConditionHistoryRecord,
} from '../domain/conditionTypes.js';
import type { ConditionRecordStore } from './conditionRecordStore.js';

export class InMemoryConditionRecordStore implements ConditionRecordStore {
  private readonly records = new Map<string, ConditionHistoryRecord[]>();

  async save(userId: string, record: ConditionDraft): Promise<void> {
    const history = this.records.get(userId) ?? [];
    history.push({
      ...record,
      recordedAt: new Date().toISOString().slice(0, 10),
    });
    this.records.set(userId, history);
  }

  async findHistoryByTraineeId(
    traineeId: string,
  ): Promise<ConditionHistoryRecord[]> {
    return [...(this.records.get(traineeId) ?? [])];
  }
}
