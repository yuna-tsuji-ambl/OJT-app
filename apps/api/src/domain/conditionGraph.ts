import { CONDITION_DRAFT_FIELDS } from './conditionConstants.js';
import type {
  ConditionDraft,
  ConditionGraphData,
  ConditionGraphTableRow,
  ConditionHistoryRecord,
} from './conditionTypes.js';

function buildGraphSeriesFromRows(
  rows: ConditionGraphTableRow[],
): Pick<ConditionGraphData, keyof ConditionDraft> {
  return Object.fromEntries(
    CONDITION_DRAFT_FIELDS.map((field) => [
      field,
      rows.map((row) => row[field]),
    ]),
  ) as Pick<ConditionGraphData, keyof ConditionDraft>;
}

export function buildConditionGraphTableRows(
  records: ConditionHistoryRecord[],
): ConditionGraphTableRow[] {
  return records.map((record) => ({ ...record }));
}

export function buildConditionGraphData(
  records: ConditionHistoryRecord[],
): ConditionGraphData {
  const rows = buildConditionGraphTableRows(records);

  return {
    labels: rows.map((row) => row.recordedAt),
    ...buildGraphSeriesFromRows(rows),
    rows,
  };
}
