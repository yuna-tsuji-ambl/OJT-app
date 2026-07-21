import type { ConditionLineChartDisplaySize } from './conditionLineChartDisplaySize.js';
import type { ConditionLineChartHorizontalScroll } from './conditionLineChartHorizontalScroll.js';
import { buildConditionLineChartScrollContentDisplaySize } from './conditionLineChartHorizontalScroll.js';

export function resolveConditionLineChartPlotDisplaySize(
  displaySize: ConditionLineChartDisplaySize,
  horizontalScroll: ConditionLineChartHorizontalScroll,
): ConditionLineChartDisplaySize {
  if (!horizontalScroll.enabled) {
    return displaySize;
  }

  return buildConditionLineChartScrollContentDisplaySize(
    displaySize,
    horizontalScroll,
  );
}
