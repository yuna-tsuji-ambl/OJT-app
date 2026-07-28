import type {
  ConditionLineChartXAxisAlignment,
  ConditionLineChartXAxisTick,
} from '@ojt-app/shared';
import { CONDITION_LINE_CHART_X_AXIS_TICKS_LABEL } from '../domain/conditionUiConstants';
import {
  buildConditionLineChartXAxisTickStyle,
  resolveConditionLineChartXAxisClassName,
} from '../domain/conditionLineChartXAxisPresentation';

interface ConditionLineChartXAxisTicksProps {
  ticks: ConditionLineChartXAxisTick[];
  axisWidth: number;
  xAxisAlignment: ConditionLineChartXAxisAlignment;
}

export function ConditionLineChartXAxisTicks({
  ticks,
  axisWidth,
  xAxisAlignment,
}: ConditionLineChartXAxisTicksProps) {
  return (
    <ul
      className={resolveConditionLineChartXAxisClassName(xAxisAlignment)}
      aria-label={CONDITION_LINE_CHART_X_AXIS_TICKS_LABEL}
      style={{ width: axisWidth }}
    >
      {ticks.map((tick, index) => (
        <li
          key={`${tick.label}-${index}`}
          className="condition-line-chart__x-axis-tick"
          aria-label={tick.label}
          style={buildConditionLineChartXAxisTickStyle(tick)}
        >
          {tick.label}
        </li>
      ))}
    </ul>
  );
}
