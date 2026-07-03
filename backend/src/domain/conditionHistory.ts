import type { ConditionHistoryRecord } from './conditionTypes.js';

export function getLatestHistoryRecord(
  records: ConditionHistoryRecord[],
): ConditionHistoryRecord | null {
  if (records.length === 0) {
    return null;
  }

  return records[records.length - 1];
}
