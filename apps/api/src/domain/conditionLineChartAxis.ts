import {
  CONDITION_VALUE_MAX,
  CONDITION_VALUE_MIN,
} from './conditionConstants.js';
import type { ConditionLineChartYAxisTick } from './conditionTypes.js';

export function buildConditionLineChartYAxisTicks(): ConditionLineChartYAxisTick[] {
  const ticks: ConditionLineChartYAxisTick[] = [];

  for (
    let value = CONDITION_VALUE_MIN;
    value <= CONDITION_VALUE_MAX;
    value += 1
  ) {
    ticks.push({ value, showGridLine: true });
  }

  return ticks;
}
