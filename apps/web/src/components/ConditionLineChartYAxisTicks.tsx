import type { ConditionLineChartYAxisTick } from '@ojt-app/shared';
import { CONDITION_LINE_CHART_Y_AXIS_TICKS_LABEL } from '../domain/conditionUiConstants';

interface ConditionLineChartYAxisTicksProps {
  ticks: ConditionLineChartYAxisTick[];
}

export function ConditionLineChartYAxisTicks({
  ticks,
}: ConditionLineChartYAxisTicksProps) {
  return (
    <ul
      className="condition-line-chart__y-axis"
      aria-label={CONDITION_LINE_CHART_Y_AXIS_TICKS_LABEL}
    >
      {ticks.map((tick) => (
        <li key={tick.value} aria-label={String(tick.value)}>
          {tick.value}
        </li>
      ))}
    </ul>
  );
}
