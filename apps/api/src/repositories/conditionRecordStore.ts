import type {
  ConditionDraft,
  ConditionHistoryRecord,
} from '../domain/conditionTypes.js';

export interface ConditionRecordStore {
  save(userId: string, record: ConditionDraft): Promise<void>;
  findHistoryByTraineeId(traineeId: string): Promise<ConditionHistoryRecord[]>;
}
