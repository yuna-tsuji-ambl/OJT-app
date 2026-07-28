import type { ConditionLineChartData } from '../api/conditionApi';
import {
  buildConditionLineChartHorizontalGridLines,
  buildConditionLineChartPlotBounds,
  buildConditionLineChartPolylinePoints,
  buildConditionLineChartVerticalGridLines,
  CONDITION_LINE_CHART_GRID_STROKE,
  CONDITION_LINE_CHART_SERIES_STROKES,
} from '../domain/conditionLineChartGeometry';
import { resolveConditionLineChartPlotDisplaySize } from '../domain/conditionLineChartPlotDisplaySize';
import { CONDITION_LINE_CHART_IMAGE_LABEL } from '../domain/conditionUiConstants';

interface ConditionLineChartPlotProps {
  lineChart: ConditionLineChartData;
}

export function ConditionLineChartPlot({
  lineChart,
}: ConditionLineChartPlotProps) {
  const displaySize = resolveConditionLineChartPlotDisplaySize(
    lineChart.displaySize,
    lineChart.horizontalScroll,
  );
  const plotXCoordinates = lineChart.xAxisAlignment.positions.map(
    (position) => position.x,
  );
  const bounds = buildConditionLineChartPlotBounds(displaySize);
  const horizontalGridLines = buildConditionLineChartHorizontalGridLines(
    lineChart.yAxisTicks,
    lineChart.yAxisMin,
    lineChart.yAxisMax,
    bounds,
    displaySize,
  );
  const verticalGridLines = buildConditionLineChartVerticalGridLines(
    lineChart.xAxisTicks,
    bounds,
  );

  return (
    <div role="img" aria-label={CONDITION_LINE_CHART_IMAGE_LABEL}>
      <svg
        aria-hidden="true"
        width={displaySize.width}
        height={displaySize.height}
        viewBox={`0 0 ${displaySize.width} ${displaySize.height}`}
      >
        {horizontalGridLines.map((line) => (
          <line
            key={line.key}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke={CONDITION_LINE_CHART_GRID_STROKE}
            strokeWidth="1"
          />
        ))}

        {verticalGridLines.map((line) => (
          <line
            key={line.key}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke={CONDITION_LINE_CHART_GRID_STROKE}
            strokeWidth="1"
          />
        ))}

        {lineChart.series.map((series, index) => (
          <polyline
            key={series.key}
            fill="none"
            stroke={CONDITION_LINE_CHART_SERIES_STROKES[index]}
            strokeWidth="2"
            points={buildConditionLineChartPolylinePoints(
              series.values,
              plotXCoordinates,
              lineChart.yAxisMin,
              lineChart.yAxisMax,
              displaySize,
            )}
          />
        ))}
      </svg>
    </div>
  );
}
