export interface ConditionDraft {
  workload: number;
  comprehension: number;
  mental: number;
}

export interface ConditionSubmitResult {
  message: string;
  record: ConditionDraft;
}

export interface ConditionHistoryRecord extends ConditionDraft {
  recordedAt: string;
}

export interface ConditionAlert {
  traineeId: string;
  hasAlert: boolean;
  message: string;
  latestMental: number;
}

export interface ConditionPageAlert {
  hasAlert: boolean;
  message: string;
}

export type ConditionGraphTableRow = ConditionHistoryRecord;

export interface ConditionLineChartSeries {
  key: keyof ConditionDraft;
  label: string;
  values: number[];
}

export interface ConditionLineChartData {
  xAxisLabels: string[];
  yAxisMin: number;
  yAxisMax: number;
  series: ConditionLineChartSeries[];
}

export interface ConditionGraphData {
  labels: string[];
  workload: number[];
  comprehension: number[];
  mental: number[];
  rows: ConditionGraphTableRow[];
  lineChart: ConditionLineChartData;
}
