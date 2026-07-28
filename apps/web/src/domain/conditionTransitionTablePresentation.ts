import type {
  ConditionTransitionTableCellBorderLayout,
  ConditionTransitionTableCellBorderSides,
} from '@ojt-app/shared';

export type ConditionTransitionTableCellBorderStyle = {
  borderTop: string;
  borderRight: string;
  borderBottom: string;
  borderLeft: string;
};

function resolveBorderSide(enabled: boolean): string {
  return enabled ? '1px solid' : 'none';
}

export function buildConditionTransitionTableCellBorderStyle(
  borders: ConditionTransitionTableCellBorderSides,
): ConditionTransitionTableCellBorderStyle {
  return {
    borderTop: resolveBorderSide(borders.top),
    borderRight: resolveBorderSide(borders.right),
    borderBottom: resolveBorderSide(borders.bottom),
    borderLeft: resolveBorderSide(borders.left),
  };
}

export function resolveConditionTransitionTableClassName(
  cellBorderLayout: Pick<ConditionTransitionTableCellBorderLayout, 'variant'>,
): string {
  return `condition-transition-table condition-transition-table--${cellBorderLayout.variant}`;
}

export function buildConditionTransitionTablePresentation(
  cellBorderLayout: ConditionTransitionTableCellBorderLayout,
): {
  className: string;
  headerCellBorderStyle: ConditionTransitionTableCellBorderStyle;
  dataCellBorderStyle: ConditionTransitionTableCellBorderStyle;
} {
  return {
    className: resolveConditionTransitionTableClassName(cellBorderLayout),
    headerCellBorderStyle: buildConditionTransitionTableCellBorderStyle(
      cellBorderLayout.headerCellBorder,
    ),
    dataCellBorderStyle: buildConditionTransitionTableCellBorderStyle(
      cellBorderLayout.dataCellBorder,
    ),
  };
}
