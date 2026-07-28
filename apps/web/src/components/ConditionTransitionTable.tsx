import type { ConditionTransitionTableData } from '../api/conditionApi';
import { buildConditionTransitionTablePresentation } from '../domain/conditionTransitionTablePresentation';
import { ConditionTransitionTableBody } from './ConditionTransitionTableBody';
import { ConditionTransitionTableHeader } from './ConditionTransitionTableHeader';

interface ConditionTransitionTableProps {
  transitionTable: ConditionTransitionTableData;
}

export function ConditionTransitionTable({
  transitionTable,
}: ConditionTransitionTableProps) {
  const { matrixLayout, cellBorderLayout, columns, rows } = transitionTable;
  const { className, headerCellBorderStyle, dataCellBorderStyle } =
    buildConditionTransitionTablePresentation(cellBorderLayout);

  return (
    <table role={matrixLayout.tableRole} className={className}>
      <ConditionTransitionTableHeader
        columns={columns}
        matrixLayout={matrixLayout}
        cellBorderStyle={headerCellBorderStyle}
      />
      <ConditionTransitionTableBody
        columns={columns}
        rows={rows}
        matrixLayout={matrixLayout}
        cellBorderStyle={dataCellBorderStyle}
      />
    </table>
  );
}
