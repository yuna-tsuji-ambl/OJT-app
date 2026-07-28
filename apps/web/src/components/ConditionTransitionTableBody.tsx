import type {
  ConditionTransitionTableColumn,
  ConditionTransitionTableMatrixLayout,
  ConditionTransitionTableRow,
} from '@ojt-app/shared';
import type { ConditionTransitionTableCellBorderStyle } from '../domain/conditionTransitionTablePresentation';
import { formatConditionTransitionTableCellValue } from '../domain/conditionTransitionTableCell';

interface ConditionTransitionTableBodyProps {
  columns: ConditionTransitionTableColumn[];
  rows: ConditionTransitionTableRow[];
  matrixLayout: ConditionTransitionTableMatrixLayout;
  cellBorderStyle: ConditionTransitionTableCellBorderStyle;
}

export function ConditionTransitionTableBody({
  columns,
  rows,
  matrixLayout,
  cellBorderStyle,
}: ConditionTransitionTableBodyProps) {
  return (
    <tbody>
      {rows.map((row, index) => (
        <tr key={`${row.recordedAt}-${index}`}>
          {columns.map((column) => (
            <td
              key={column.key}
              role={matrixLayout.dataCellRole}
              style={cellBorderStyle}
            >
              {formatConditionTransitionTableCellValue(row, column.key)}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}
