import type { ConditionLineChartDisplaySize } from './conditionLineChartDisplaySize.js';
import { CONDITION_LINE_CHART_DISPLAY_SIZE } from './conditionLineChartDisplaySize.js';

/** U-C11: 横スクロール時の記録点あたりの最小幅（px） */
export const CONDITION_LINE_CHART_SCROLL_MIN_POINT_WIDTH = 48;

export interface ConditionLineChartHorizontalScroll {
  enabled: boolean;
  viewportWidth: number;
  contentWidth: number;
  fixedYAxis: boolean;
}

export function buildConditionLineChartContentPlotWidth(
  pointCount: number,
  displaySize: ConditionLineChartDisplaySize,
): number {
  if (pointCount <= 1) {
    return displaySize.plotWidth;
  }

  return Math.max(
    displaySize.plotWidth,
    CONDITION_LINE_CHART_SCROLL_MIN_POINT_WIDTH * (pointCount - 1),
  );
}

export function buildConditionLineChartHorizontalScroll(
  pointCount: number,
  displaySize: ConditionLineChartDisplaySize = CONDITION_LINE_CHART_DISPLAY_SIZE,
): ConditionLineChartHorizontalScroll {
  const contentPlotWidth = buildConditionLineChartContentPlotWidth(
    pointCount,
    displaySize,
  );
  const contentWidth =
    displaySize.paddingLeft + contentPlotWidth + displaySize.paddingRight;

  return {
    enabled: contentWidth > displaySize.width,
    viewportWidth: displaySize.width,
    contentWidth,
    fixedYAxis: true,
  };
}

export function buildConditionLineChartScrollContentDisplaySize(
  displaySize: ConditionLineChartDisplaySize,
  horizontalScroll: ConditionLineChartHorizontalScroll,
): ConditionLineChartDisplaySize {
  const contentPlotWidth =
    horizontalScroll.contentWidth -
    displaySize.paddingLeft -
    displaySize.paddingRight;

  return {
    ...displaySize,
    width: horizontalScroll.contentWidth,
    plotWidth: contentPlotWidth,
  };
}
