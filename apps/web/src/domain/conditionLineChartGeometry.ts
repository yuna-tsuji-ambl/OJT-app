export const CONDITION_LINE_CHART_WIDTH = 240;
export const CONDITION_LINE_CHART_HEIGHT = 120;

export const CONDITION_LINE_CHART_SERIES_STROKES = [
  '#2563eb',
  '#16a34a',
  '#dc2626',
] as const;

export function formatConditionLineChartYAxisScale(
  yMin: number,
  yMax: number,
): string {
  return `${yMin}〜${yMax}`;
}

export function formatConditionLineChartSeriesValues(values: number[]): string {
  return values.join(', ');
}

export function buildConditionLineChartPolylinePoints(
  values: number[],
  yMin: number,
  yMax: number,
  width: number = CONDITION_LINE_CHART_WIDTH,
  height: number = CONDITION_LINE_CHART_HEIGHT,
): string {
  if (values.length === 0) {
    return '';
  }

  const xStep = values.length === 1 ? 0 : width / (values.length - 1);

  return values
    .map((value, index) => {
      const x = values.length === 1 ? width / 2 : index * xStep;
      const ratio = (value - yMin) / (yMax - yMin);
      const y = height - ratio * height;

      return `${x},${y}`;
    })
    .join(' ');
}
