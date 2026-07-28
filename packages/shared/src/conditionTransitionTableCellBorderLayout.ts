import type { ConditionTransitionTableColumn } from './conditionTransitionTableTypes.js';

export interface ConditionTransitionTableCellBorderSides {
  top: boolean;
  right: boolean;
  bottom: boolean;
  left: boolean;
}

export interface ConditionTransitionTableCellBorderLayout {
  variant: 'grid';
  headerCellBorder: ConditionTransitionTableCellBorderSides;
  dataCellBorder: ConditionTransitionTableCellBorderSides;
  columnCount: number;
  headerCellCount: number;
  dataCellCount: number;
}

export const CONDITION_TRANSITION_TABLE_CELL_BORDER_SIDES = {
  top: true,
  right: true,
  bottom: true,
  left: true,
} as const satisfies ConditionTransitionTableCellBorderSides;

export const CONDITION_TRANSITION_TABLE_CELL_BORDER_LAYOUT_BASE = {
  variant: 'grid',
  headerCellBorder: CONDITION_TRANSITION_TABLE_CELL_BORDER_SIDES,
  dataCellBorder: CONDITION_TRANSITION_TABLE_CELL_BORDER_SIDES,
} as const satisfies Omit<
  ConditionTransitionTableCellBorderLayout,
  'columnCount' | 'headerCellCount' | 'dataCellCount'
>;

export function buildConditionTransitionTableCellBorderLayout(
  columns: readonly Pick<ConditionTransitionTableColumn, 'label'>[],
  dataRowCount: number,
): ConditionTransitionTableCellBorderLayout {
  const columnCount = columns.length;

  return {
    ...CONDITION_TRANSITION_TABLE_CELL_BORDER_LAYOUT_BASE,
    columnCount,
    headerCellCount: columnCount,
    dataCellCount: columnCount * dataRowCount,
  };
}
