import type { ConditionLineChartData } from '../api/conditionApi';
import {
  buildConditionLineChartPolylinePoints,
  CONDITION_LINE_CHART_HEIGHT,
  CONDITION_LINE_CHART_SERIES_STROKES,
  CONDITION_LINE_CHART_WIDTH,
  formatConditionLineChartSeriesValues,
  formatConditionLineChartYAxisScale,
} from '../domain/conditionLineChartGeometry';
import {
  CONDITION_LINE_CHART_IMAGE_LABEL,
  CONDITION_LINE_CHART_SERIES_LIST_LABEL,
  CONDITION_LINE_CHART_X_AXIS_LIST_LABEL,
} from '../domain/conditionUiConstants';

interface ConditionLineChartProps {
  lineChart: ConditionLineChartData;
}

export function ConditionLineChart({ lineChart }: ConditionLineChartProps) {
  return (
    <>
      <div role="img" aria-label={CONDITION_LINE_CHART_IMAGE_LABEL}>
        <svg
          aria-hidden="true"
          width={CONDITION_LINE_CHART_WIDTH}
          height={CONDITION_LINE_CHART_HEIGHT}
          viewBox={`0 0 ${CONDITION_LINE_CHART_WIDTH} ${CONDITION_LINE_CHART_HEIGHT}`}
        >
          {lineChart.series.map((series, index) => (
            <polyline
              key={series.key}
              fill="none"
              stroke={CONDITION_LINE_CHART_SERIES_STROKES[index]}
              strokeWidth="2"
              points={buildConditionLineChartPolylinePoints(
                series.values,
                lineChart.yAxisMin,
                lineChart.yAxisMax,
              )}
            />
          ))}
        </svg>
      </div>
      <p>
        {formatConditionLineChartYAxisScale(
          lineChart.yAxisMin,
          lineChart.yAxisMax,
        )}
      </p>
      <ul aria-label={CONDITION_LINE_CHART_X_AXIS_LIST_LABEL}>
        {lineChart.xAxisLabels.map((label) => (
          <li key={label}>{label}</li>
        ))}
      </ul>
      <ul aria-label={CONDITION_LINE_CHART_SERIES_LIST_LABEL}>
        {lineChart.series.map((series) => (
          <li key={series.key} aria-label={series.label}>
            {formatConditionLineChartSeriesValues(series.values)}
          </li>
        ))}
      </ul>
    </>
  );
}
