import { ConditionRecordNotFoundError } from './errors.js';
import type {
  ConditionDraft,
  ConditionHistoryRecord,
} from './conditionTypes.js';

export type TraineeHistoryTransform<T> = (
  traineeId: string,
  records: ConditionHistoryRecord[],
) => T;

export function formatConditionRecordedAt(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function createConditionHistoryRecord(
  draft: ConditionDraft,
  recordedAt: string = formatConditionRecordedAt(),
): ConditionHistoryRecord {
  return { ...draft, recordedAt };
}

export function getLatestHistoryRecord(
  records: ConditionHistoryRecord[],
): ConditionHistoryRecord | null {
  return records.at(-1) ?? null;
}

export function requireLatestHistoryRecord(
  traineeId: string,
  records: ConditionHistoryRecord[],
): ConditionHistoryRecord {
  const latest = getLatestHistoryRecord(records);

  if (!latest) {
    throw new ConditionRecordNotFoundError(traineeId);
  }

  return latest;
}
