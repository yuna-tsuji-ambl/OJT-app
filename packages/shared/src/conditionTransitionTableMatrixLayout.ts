import type { ConditionTransitionTableColumn } from './conditionTransitionTableTypes.js';

export interface ConditionTransitionTableMatrixLayout {
  variant: 'l-matrix';
  tableRole: 'table';
  headerRowIndex: 0;
  headerCellRole: 'columnheader';
  dataCellRole: 'cell';
  dataRowStartIndex: 1;
  columnLabels: string[];
  dataRowCount: number;
}

export const CONDITION_TRANSITION_TABLE_MATRIX_LAYOUT_BASE = {
  variant: 'l-matrix',
  tableRole: 'table',
  headerRowIndex: 0,
  headerCellRole: 'columnheader',
  dataCellRole: 'cell',
  dataRowStartIndex: 1,
} as const satisfies Omit<
  ConditionTransitionTableMatrixLayout,
  'columnLabels' | 'dataRowCount'
>;

export function buildConditionTransitionTableMatrixLayout(
  columns: readonly Pick<ConditionTransitionTableColumn, 'label'>[],
  dataRowCount: number,
): ConditionTransitionTableMatrixLayout {
  return {
    ...CONDITION_TRANSITION_TABLE_MATRIX_LAYOUT_BASE,
    columnLabels: columns.map((column) => column.label),
    dataRowCount,
  };
}
