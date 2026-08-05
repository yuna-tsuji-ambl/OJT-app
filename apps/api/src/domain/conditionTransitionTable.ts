import {
  buildConditionTransitionTableCellBorderLayout,
  buildConditionTransitionTableMatrixLayout,
} from '@ojt-app/shared';
import { CONDITION_TRANSITION_TABLE_COLUMNS } from './conditionConstants.js';
import type {
  ConditionGraphTableRow,
  ConditionTransitionTableData,
} from './conditionTypes.js';

export function buildConditionTransitionTable(
  rows: ConditionGraphTableRow[],
): ConditionTransitionTableData {
  const columns = [...CONDITION_TRANSITION_TABLE_COLUMNS];

  return {
    columns,
    rows,
    matrixLayout: buildConditionTransitionTableMatrixLayout(
      columns,
      rows.length,
    ),
    cellBorderLayout: buildConditionTransitionTableCellBorderLayout(
      columns,
      rows.length,
    ),
  };
}
