import { buildConditionLineChartData } from './conditionLineChart.js';
import type {
  ConditionDraft,
  ConditionGraphData,
  ConditionGraphTableRow,
  ConditionHistoryRecord,
  ConditionLineChartData,
} from './conditionTypes.js';

function buildDraftSeriesFromLineChart(
  lineChart: ConditionLineChartData,
): Pick<ConditionGraphData, keyof ConditionDraft> {
  return Object.fromEntries(
    lineChart.series.map((series) => [series.key, series.values]),
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
  const lineChart = buildConditionLineChartData(records);

  return {
    labels: lineChart.xAxisLabels,
    ...buildDraftSeriesFromLineChart(lineChart),
    rows,
    lineChart,
  };
}
