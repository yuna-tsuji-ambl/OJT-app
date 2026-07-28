import type {
  ConditionLineChartData,
  ConditionTransitionTableData,
} from '@ojt-app/shared';

export type {
  ConditionLineChartData,
  ConditionLineChartDisplaySize,
  ConditionLineChartHorizontalScroll,
  ConditionLineChartSeries,
  ConditionLineChartSeriesKey,
  ConditionLineChartSupplementalDisplay,
  ConditionLineChartXAxisAlignment,
  ConditionLineChartXAxisTick,
  ConditionLineChartYAxisTick,
  ConditionTransitionTableCellBorderLayout,
  ConditionTransitionTableCellBorderSides,
  ConditionTransitionTableColumn,
  ConditionTransitionTableColumnKey,
  ConditionTransitionTableData,
  ConditionTransitionTableRow,
} from '@ojt-app/shared';

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

export interface ConditionGraphData {
  labels: string[];
  workload: number[];
  comprehension: number[];
  mental: number[];
  rows: ConditionGraphTableRow[];
  lineChart: ConditionLineChartData;
  transitionTable: ConditionTransitionTableData;
}
