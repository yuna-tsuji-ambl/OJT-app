import type { ConditionLineChartDisplaySize } from './conditionLineChartDisplaySize.js';
import type { ConditionLineChartHorizontalScroll } from './conditionLineChartHorizontalScroll.js';
import type { ConditionLineChartXAxisAlignment } from './conditionLineChartXAxisAlignment.js';

export type ConditionLineChartSeriesKey =
  'workload' | 'comprehension' | 'mental';

export interface ConditionLineChartSeries {
  key: ConditionLineChartSeriesKey;
  label: string;
  values: number[];
}

export interface ConditionLineChartYAxisTick {
  value: number;
  showGridLine: boolean;
}

export interface ConditionLineChartXAxisTick {
  label: string;
  showGridLine: boolean;
  x: number;
  y: number;
}

export interface ConditionLineChartSupplementalDisplay {
  showYAxisRangeText: boolean;
  showDateList: boolean;
  showSeriesValueLists: boolean;
}

export const CONDITION_LINE_CHART_SUPPLEMENTAL_DISPLAY = {
  showYAxisRangeText: false,
  showDateList: false,
  showSeriesValueLists: false,
} as const satisfies ConditionLineChartSupplementalDisplay;

export interface ConditionLineChartData {
  xAxisLabels: string[];
  yAxisMin: number;
  yAxisMax: number;
  yAxisTicks: ConditionLineChartYAxisTick[];
  xAxisTicks: ConditionLineChartXAxisTick[];
  supplementalDisplay: ConditionLineChartSupplementalDisplay;
  displaySize: ConditionLineChartDisplaySize;
  horizontalScroll: ConditionLineChartHorizontalScroll;
  xAxisAlignment: ConditionLineChartXAxisAlignment;
  series: ConditionLineChartSeries[];
}
