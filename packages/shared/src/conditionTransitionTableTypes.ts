import type { ConditionTransitionTableCellBorderLayout } from './conditionTransitionTableCellBorderLayout.js';
import type { ConditionTransitionTableMatrixLayout } from './conditionTransitionTableMatrixLayout.js';

export type ConditionTransitionTableColumnKey =
  'recordedAt' | 'workload' | 'comprehension' | 'mental';

export interface ConditionTransitionTableColumn {
  key: ConditionTransitionTableColumnKey;
  label: string;
}

export interface ConditionTransitionTableRow {
  recordedAt: string;
  workload: number;
  comprehension: number;
  mental: number;
}

export interface ConditionTransitionTableData {
  columns: ConditionTransitionTableColumn[];
  rows: ConditionTransitionTableRow[];
  matrixLayout: ConditionTransitionTableMatrixLayout;
  cellBorderLayout: ConditionTransitionTableCellBorderLayout;
}
