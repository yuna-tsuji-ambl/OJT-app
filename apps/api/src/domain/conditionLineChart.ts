import {
  CONDITION_DRAFT_FIELDS,
  CONDITION_FIELD_LABELS,
  CONDITION_VALUE_MAX,
  CONDITION_VALUE_MIN,
} from './conditionConstants.js';
import type {
  ConditionHistoryRecord,
  ConditionLineChartData,
  ConditionLineChartSeries,
} from './conditionTypes.js';

function buildLineChartSeries(
  records: ConditionHistoryRecord[],
): ConditionLineChartSeries[] {
  return CONDITION_DRAFT_FIELDS.map((key) => ({
    key,
    label: CONDITION_FIELD_LABELS[key],
    values: records.map((record) => record[key]),
  }));
}

export function buildConditionLineChartData(
  records: ConditionHistoryRecord[],
): ConditionLineChartData {
  return {
    xAxisLabels: records.map((record) => record.recordedAt),
    yAxisMin: CONDITION_VALUE_MIN,
    yAxisMax: CONDITION_VALUE_MAX,
    series: buildLineChartSeries(records),
  };
}
