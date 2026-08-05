import type {
  ConditionTransitionTableColumnKey,
  ConditionTransitionTableRow,
} from '@ojt-app/shared';

export function formatConditionTransitionTableCellValue(
  row: ConditionTransitionTableRow,
  key: ConditionTransitionTableColumnKey,
): string {
  return String(row[key]);
}
