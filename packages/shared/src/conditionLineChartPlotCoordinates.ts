import type { ConditionLineChartDisplaySize } from './conditionLineChartDisplaySize.js';

export function buildConditionLineChartPlotXCoordinate(
  index: number,
  pointCount: number,
  displaySize: ConditionLineChartDisplaySize,
): number {
  if (pointCount <= 1) {
    return displaySize.paddingLeft + displaySize.plotWidth / 2;
  }

  const xStep = displaySize.plotWidth / (pointCount - 1);

  return displaySize.paddingLeft + index * xStep;
}

export function buildConditionLineChartPlotXCoordinates(
  pointCount: number,
  displaySize: ConditionLineChartDisplaySize,
): number[] {
  if (pointCount === 0) {
    return [];
  }

  return Array.from({ length: pointCount }, (_, index) =>
    buildConditionLineChartPlotXCoordinate(index, pointCount, displaySize),
  );
}

/** U-C14: プロット領域下端の横軸基準線 y 座標 */
export function buildConditionLineChartXAxisBaselineY(
  displaySize: ConditionLineChartDisplaySize,
): number {
  return displaySize.paddingTop + displaySize.plotHeight;
}
