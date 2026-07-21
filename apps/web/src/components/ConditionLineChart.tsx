import type { ConditionLineChartData } from '../api/conditionApi';
import { CONDITION_LINE_CHART_GRID_LABEL } from '../domain/conditionUiConstants';
import { ConditionLineChartPlot } from './ConditionLineChartPlot';
import { ConditionLineChartScrollRegion } from './ConditionLineChartScrollRegion';
import { ConditionLineChartXAxisTicks } from './ConditionLineChartXAxisTicks';
import { ConditionLineChartYAxisTicks } from './ConditionLineChartYAxisTicks';

interface ConditionLineChartProps {
  lineChart: ConditionLineChartData;
}

function resolveLineChartAxisWidth(lineChart: ConditionLineChartData): number {
  return lineChart.horizontalScroll.enabled
    ? lineChart.horizontalScroll.contentWidth
    : lineChart.displaySize.width;
}

function ConditionLineChartDefaultLayout({
  lineChart,
}: ConditionLineChartProps) {
  const axisWidth = resolveLineChartAxisWidth(lineChart);

  return (
    <>
      <ConditionLineChartYAxisTicks ticks={lineChart.yAxisTicks} />
      <ConditionLineChartPlot lineChart={lineChart} />
      <ConditionLineChartXAxisTicks
        ticks={lineChart.xAxisTicks}
        axisWidth={axisWidth}
        xAxisAlignment={lineChart.xAxisAlignment}
      />
    </>
  );
}

function ConditionLineChartScrollableLayout({
  lineChart,
}: ConditionLineChartProps) {
  const { horizontalScroll } = lineChart;
  const axisWidth = resolveLineChartAxisWidth(lineChart);

  return (
    <>
      <ConditionLineChartYAxisTicks ticks={lineChart.yAxisTicks} />
      <ConditionLineChartScrollRegion
        viewportWidth={horizontalScroll.viewportWidth}
        contentWidth={horizontalScroll.contentWidth}
      >
        <ConditionLineChartPlot lineChart={lineChart} />
        <ConditionLineChartXAxisTicks
          ticks={lineChart.xAxisTicks}
          axisWidth={axisWidth}
          xAxisAlignment={lineChart.xAxisAlignment}
        />
      </ConditionLineChartScrollRegion>
    </>
  );
}

export function ConditionLineChart({ lineChart }: ConditionLineChartProps) {
  const useFixedYAxisScroll =
    lineChart.horizontalScroll.enabled && lineChart.horizontalScroll.fixedYAxis;

  return (
    <div
      className={
        useFixedYAxisScroll
          ? 'condition-line-chart condition-line-chart--scrollable'
          : 'condition-line-chart'
      }
      role="group"
      aria-label={CONDITION_LINE_CHART_GRID_LABEL}
    >
      {useFixedYAxisScroll ? (
        <ConditionLineChartScrollableLayout lineChart={lineChart} />
      ) : (
        <ConditionLineChartDefaultLayout lineChart={lineChart} />
      )}
    </div>
  );
}
