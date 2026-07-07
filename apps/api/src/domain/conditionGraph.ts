import { CONDITION_DRAFT_FIELDS } from './conditionConstants.js';
import type {
  ConditionDraft,
  ConditionGraphData,
  ConditionHistoryRecord,
} from './conditionTypes.js';

function buildGraphSeries(
  records: ConditionHistoryRecord[],
): Pick<ConditionGraphData, keyof ConditionDraft> {
  return Object.fromEntries(
    CONDITION_DRAFT_FIELDS.map((field) => [
      field,
      records.map((record) => record[field]),
    ]),
  ) as Pick<ConditionGraphData, keyof ConditionDraft>;
}

export function buildConditionGraphData(
  records: ConditionHistoryRecord[],
): ConditionGraphData {
  return {
    labels: records.map((record) => record.recordedAt),
    ...buildGraphSeries(records),
  };
}
