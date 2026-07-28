import type {
  ConditionTransitionTableColumn,
  ConditionTransitionTableMatrixLayout,
} from '@ojt-app/shared';
import type { ConditionTransitionTableCellBorderStyle } from '../domain/conditionTransitionTablePresentation';

interface ConditionTransitionTableHeaderProps {
  columns: ConditionTransitionTableColumn[];
  matrixLayout: ConditionTransitionTableMatrixLayout;
  cellBorderStyle: ConditionTransitionTableCellBorderStyle;
}

export function ConditionTransitionTableHeader({
  columns,
  matrixLayout,
  cellBorderStyle,
}: ConditionTransitionTableHeaderProps) {
  return (
    <thead>
      <tr>
        {columns.map((column) => (
          <th
            key={column.key}
            role={matrixLayout.headerCellRole}
            style={cellBorderStyle}
          >
            {column.label}
          </th>
        ))}
      </tr>
    </thead>
  );
}
