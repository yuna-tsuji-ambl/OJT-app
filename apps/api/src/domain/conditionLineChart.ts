import {
  CONDITION_LINE_CHART_SUPPLEMENTAL_DISPLAY,
  buildConditionLineChartDisplaySize,
  buildConditionLineChartHorizontalScroll,
  buildConditionLineChartXAxisAlignment,
  buildConditionLineChartXAxisTicksFromAlignment,
  resolveConditionLineChartPlotDisplaySize,
} from '@ojt-app/shared';
import {
  CONDITION_DRAFT_FIELDS,
  CONDITION_FIELD_LABELS,
  CONDITION_VALUE_MAX,
  CONDITION_VALUE_MIN,
} from './conditionConstants.js';
import { buildConditionLineChartYAxisTicks } from './conditionLineChartAxis.js';
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
  const xAxisLabels = records.map((record) => record.recordedAt);
  const displaySize = buildConditionLineChartDisplaySize();
  const horizontalScroll = buildConditionLineChartHorizontalScroll(
    records.length,
    displaySize,
  );
  const plotDisplaySize = resolveConditionLineChartPlotDisplaySize(
    displaySize,
    horizontalScroll,
  );
  const xAxisAlignment = buildConditionLineChartXAxisAlignment(
    xAxisLabels,
    plotDisplaySize,
  );

  return {
    xAxisLabels,
    yAxisMin: CONDITION_VALUE_MIN,
    yAxisMax: CONDITION_VALUE_MAX,
    yAxisTicks: buildConditionLineChartYAxisTicks(),
    xAxisTicks: buildConditionLineChartXAxisTicksFromAlignment(xAxisAlignment),
    supplementalDisplay: { ...CONDITION_LINE_CHART_SUPPLEMENTAL_DISPLAY },
    displaySize,
    horizontalScroll,
    xAxisAlignment,
    series: buildLineChartSeries(records),
  };
}
