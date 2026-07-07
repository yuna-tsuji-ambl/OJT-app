import type { AuthUser } from '../auth/types';
import { fetchWithAuth } from './authHeaders';
import { parseJsonResponse } from './jsonResponse';

export interface ConditionDraft {
  workload: number;
  comprehension: number;
  mental: number;
}

export interface ConditionSubmitResult {
  message: string;
  record: ConditionDraft;
}

export interface ConditionHistoryRecord extends ConditionDraft {
  recordedAt: string;
}

export interface ConditionAlert {
  traineeId: string;
  hasAlert: boolean;
  message: string;
  latestMental: number;
}

export interface ConditionGraphData {
  labels: string[];
  workload: number[];
  comprehension: number[];
  mental: number[];
}

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
