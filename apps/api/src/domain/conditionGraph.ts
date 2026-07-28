import { buildConditionLineChartData } from './conditionLineChart.js';
import { buildConditionGraphTableRows } from './conditionGraphTableRows.js';
import { buildConditionTransitionTable } from './conditionTransitionTable.js';
import type {
  ConditionDraft,
  ConditionGraphData,
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
    transitionTable: buildConditionTransitionTable(rows),
  };
}
