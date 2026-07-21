import type {
  ConditionLineChartXAxisAlignment,
  ConditionLineChartXAxisTick,
} from '@ojt-app/shared';

export type ConditionLineChartXAxisTickStyle = {
  left: number;
  bottom: number;
};

export function resolveConditionLineChartXAxisClassName(
  alignment: Pick<ConditionLineChartXAxisAlignment, 'labelBaseline'>,
): string {
  const baseClassName = 'condition-line-chart__x-axis';

  if (alignment.labelBaseline === 'bottom') {
    return `${baseClassName} ${baseClassName}--baseline-bottom`;
  }

  return baseClassName;
}

export function buildConditionLineChartXAxisTickStyle(
  tick: ConditionLineChartXAxisTick,
): ConditionLineChartXAxisTickStyle {
  return {
    left: tick.x,
    bottom: 0,
  };
}
