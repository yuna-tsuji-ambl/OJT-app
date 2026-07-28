import { createConditionHistoryRecord } from '../domain/conditionHistory.js';
import type {
  ConditionDraft,
  ConditionHistoryRecord,
} from '../domain/conditionTypes.js';
import type { ConditionRecordStore } from './conditionRecordStore.js';

export class InMemoryConditionRecordStore implements ConditionRecordStore {
  private readonly records = new Map<string, ConditionHistoryRecord[]>();

  async save(userId: string, record: ConditionDraft): Promise<void> {
    const history = this.records.get(userId) ?? [];
    history.push(createConditionHistoryRecord(record));
    this.records.set(userId, history);
  }

  async findHistoryByTraineeId(
    traineeId: string,
  ): Promise<ConditionHistoryRecord[]> {
    return (this.records.get(traineeId) ?? []).map((record) => ({ ...record }));
  }
}
