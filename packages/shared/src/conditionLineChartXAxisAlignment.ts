import type { ConditionLineChartDisplaySize } from './conditionLineChartDisplaySize.js';
import {
  buildConditionLineChartPlotXCoordinates,
  buildConditionLineChartXAxisBaselineY,
} from './conditionLineChartPlotCoordinates.js';
import type { ConditionLineChartXAxisTick } from './conditionLineChartTypes.js';

export interface ConditionLineChartXAxisAlignmentPosition {
  recordIndex: number;
  label: string;
  x: number;
  y: number;
}

export interface ConditionLineChartXAxisAlignment {
  labelAnchor: 'center';
  labelBaseline: 'bottom';
  baselineY: number;
  positions: ConditionLineChartXAxisAlignmentPosition[];
}

export const CONDITION_LINE_CHART_X_AXIS_ALIGNMENT_BASE = {
  labelAnchor: 'center',
  labelBaseline: 'bottom',
} as const satisfies Pick<
  ConditionLineChartXAxisAlignment,
  'labelAnchor' | 'labelBaseline'
>;

export function buildConditionLineChartXAxisAlignment(
  xAxisLabels: string[],
  plotDisplaySize: ConditionLineChartDisplaySize,
): ConditionLineChartXAxisAlignment {
  const baselineY = buildConditionLineChartXAxisBaselineY(plotDisplaySize);
  const xCoordinates = buildConditionLineChartPlotXCoordinates(
    xAxisLabels.length,
    plotDisplaySize,
  );

  return {
    ...CONDITION_LINE_CHART_X_AXIS_ALIGNMENT_BASE,
    baselineY,
    positions: xAxisLabels.map((label, index) => ({
      recordIndex: index,
      label,
      x: xCoordinates[index]!,
      y: baselineY,
    })),
  };
}

export function buildConditionLineChartXAxisTicksFromAlignment(
  xAxisAlignment: ConditionLineChartXAxisAlignment,
): ConditionLineChartXAxisTick[] {
  return xAxisAlignment.positions.map((position) => ({
    label: position.label,
    showGridLine: true,
    x: position.x,
    y: position.y,
  }));
}
