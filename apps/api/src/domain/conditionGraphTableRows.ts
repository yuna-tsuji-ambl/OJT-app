import type {
  ConditionGraphTableRow,
  ConditionHistoryRecord,
} from './conditionTypes.js';

export function buildConditionGraphTableRows(
  records: ConditionHistoryRecord[],
): ConditionGraphTableRow[] {
  return records.map((record) => ({ ...record }));
}
