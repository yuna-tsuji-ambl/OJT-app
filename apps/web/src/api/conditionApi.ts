import type { AuthUser } from '../auth/types';
import type {
  ConditionDraft,
  ConditionAlert,
  ConditionGraphData,
  ConditionHistoryRecord,
  ConditionPageAlert,
  ConditionSubmitResult,
} from './conditionTypes';
import { fetchWithAuth } from './authHeaders';
import { parseJsonResponse } from './jsonResponse';

export type {
  ConditionAlert,
  ConditionDraft,
  ConditionGraphData,
  ConditionGraphTableRow,
  ConditionHistoryRecord,
  ConditionLineChartData,
  ConditionLineChartDisplaySize,
  ConditionLineChartHorizontalScroll,
  ConditionLineChartSeries,
  ConditionLineChartSeriesKey,
  ConditionLineChartXAxisAlignment,
  ConditionLineChartXAxisTick,
  ConditionLineChartYAxisTick,
  ConditionPageAlert,
  ConditionSubmitResult,
  ConditionTransitionTableCellBorderLayout,
  ConditionTransitionTableCellBorderSides,
  ConditionTransitionTableColumn,
  ConditionTransitionTableColumnKey,
  ConditionTransitionTableData,
} from './conditionTypes';

export async function submitConditionRecord(
  draft: ConditionDraft,
  user: AuthUser,
): Promise<ConditionSubmitResult> {
  const response = await fetchWithAuth('/api/condition', user, {
    method: 'POST',
    body: JSON.stringify(draft),
  });

  return parseJsonResponse(response, 'Failed to submit condition record');
}

export async function fetchConditionAlerts(
  user: AuthUser,
): Promise<ConditionAlert[]> {
  const response = await fetchWithAuth('/api/condition/alerts', user);
  return parseJsonResponse(response, 'Failed to fetch condition alerts');
}

export async function fetchLatestConditionRecord(
  traineeId: string,
  user: AuthUser,
): Promise<ConditionHistoryRecord> {
  const response = await fetchWithAuth(
    `/api/condition/trainees/${traineeId}/latest`,
    user,
  );

  return parseJsonResponse(response, 'Failed to fetch latest condition record');
}

export async function fetchConditionGraphData(
  traineeId: string,
  user: AuthUser,
): Promise<ConditionGraphData> {
  const response = await fetchWithAuth(
    `/api/condition/trainees/${traineeId}/graph`,
    user,
  );

  return parseJsonResponse(response, 'Failed to fetch condition graph data');
}

export async function fetchConditionPageAlert(
  traineeId: string,
  user: AuthUser,
): Promise<ConditionPageAlert> {
  const response = await fetchWithAuth(
    `/api/condition/trainees/${traineeId}/page-alert`,
    user,
  );

  return parseJsonResponse(response, 'Failed to fetch condition page alert');
}
