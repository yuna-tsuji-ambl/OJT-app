import { CONDITION_FIELD } from './conditionConstants.js';
import type { ConditionField } from './conditionConstants.js';
import type {
  ConditionGraphData,
  ConditionHistoryRecord,
} from './conditionTypes.js';

function extractGraphSeries(
  records: ConditionHistoryRecord[],
  field: ConditionField,
): number[] {
  return records.map((record) => record[field]);
}

export function buildConditionGraphData(
  records: ConditionHistoryRecord[],
): ConditionGraphData {
  return {
    labels: records.map((record) => record.recordedAt),
    workload: extractGraphSeries(records, CONDITION_FIELD.WORKLOAD),
    comprehension: extractGraphSeries(records, CONDITION_FIELD.COMPREHENSION),
    mental: extractGraphSeries(records, CONDITION_FIELD.MENTAL),
  };
}
