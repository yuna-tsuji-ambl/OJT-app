import { ConditionRecordNotFoundError } from './errors.js';
import type { ConditionHistoryRecord } from './conditionTypes.js';

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
