import type { AuthUser } from '../auth/types';

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

function authHeaders(user: AuthUser): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'X-User-Id': user.userId,
    'X-User-Role': user.role,
  };
}

export async function submitConditionRecord(
  draft: ConditionDraft,
  user: AuthUser,
): Promise<ConditionSubmitResult> {
  const response = await fetch('/api/condition', {
    method: 'POST',
    headers: authHeaders(user),
    body: JSON.stringify(draft),
  });

  if (!response.ok) {
    throw new Error('Failed to submit condition record');
  }

  return response.json() as Promise<ConditionSubmitResult>;
}

export async function fetchConditionAlerts(
  user: AuthUser,
): Promise<ConditionAlert[]> {
  const response = await fetch('/api/condition/alerts', {
    headers: authHeaders(user),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch condition alerts');
  }

  return response.json() as Promise<ConditionAlert[]>;
}

export async function fetchLatestConditionRecord(
  traineeId: string,
  user: AuthUser,
): Promise<ConditionHistoryRecord> {
  const response = await fetch(`/api/condition/trainees/${traineeId}/latest`, {
    headers: authHeaders(user),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch latest condition record');
  }

  return response.json() as Promise<ConditionHistoryRecord>;
}
