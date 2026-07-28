import type {
  ConditionLineChartDisplaySize,
  ConditionLineChartXAxisTick,
  ConditionLineChartYAxisTick,
} from '@ojt-app/shared';

export const CONDITION_LINE_CHART_GRID_STROKE = '#d1d5db';

export const CONDITION_LINE_CHART_SERIES_STROKES = [
  '#2563eb',
  '#16a34a',
  '#dc2626',
] as const;

export interface ConditionLineChartPlotBounds {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface ConditionLineChartGridLine {
  key: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export function buildConditionLineChartPlotBounds(
  displaySize: ConditionLineChartDisplaySize,
): ConditionLineChartPlotBounds {
  return {
    top: displaySize.paddingTop,
    bottom: displaySize.paddingTop + displaySize.plotHeight,
    left: displaySize.paddingLeft,
    right: displaySize.paddingLeft + displaySize.plotWidth,
  };
}

export function buildConditionLineChartYCoordinate(
  value: number,
  yMin: number,
  yMax: number,
  displaySize: ConditionLineChartDisplaySize,
): number {
  const ratio = (value - yMin) / (yMax - yMin);

  return displaySize.paddingTop + (1 - ratio) * displaySize.plotHeight;
}

export function buildConditionLineChartHorizontalGridLines(
  yAxisTicks: ConditionLineChartYAxisTick[],
  yMin: number,
  yMax: number,
  bounds: ConditionLineChartPlotBounds,
  displaySize: ConditionLineChartDisplaySize,
): ConditionLineChartGridLine[] {
  return yAxisTicks
    .filter((tick) => tick.showGridLine)
    .map((tick) => {
      const y = buildConditionLineChartYCoordinate(
        tick.value,
        yMin,
        yMax,
        displaySize,
      );

      return {
        key: `y-grid-${tick.value}`,
        x1: bounds.left,
        y1: y,
        x2: bounds.right,
        y2: y,
      };
    });
}

export function buildConditionLineChartVerticalGridLines(
  xAxisTicks: ConditionLineChartXAxisTick[],
  bounds: ConditionLineChartPlotBounds,
): ConditionLineChartGridLine[] {
  return xAxisTicks.flatMap((tick, index) => {
    if (!tick.showGridLine) {
      return [];
    }

    return [
      {
        key: `x-grid-${tick.label}-${index}`,
        x1: tick.x,
        y1: bounds.top,
        x2: tick.x,
        y2: bounds.bottom,
      },
    ];
  });
}

export function buildConditionLineChartPolylinePoints(
  values: number[],
  plotXCoordinates: number[],
  yMin: number,
  yMax: number,
  displaySize: ConditionLineChartDisplaySize,
): string {
  if (values.length === 0) {
    return '';
  }

  return values
    .map((value, index) => {
      const x = plotXCoordinates[index]!;
      const y = buildConditionLineChartYCoordinate(
        value,
        yMin,
        yMax,
        displaySize,
      );

      return `${x},${y}`;
    })
    .join(' ');
}
