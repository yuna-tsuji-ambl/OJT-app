import type { AuthUser } from '../auth/types';
import { fetchWithAuth } from './authHeaders';
import { parseJsonResponse } from './jsonResponse';
import type { TrainerStatusRecord } from '../domain/statusTypes';
import type { TrainerStatusType } from '../domain/statusConstants';

export type { TrainerStatusRecord };

export async function updateTrainerStatus(
  status: TrainerStatusType,
  user: AuthUser,
): Promise<TrainerStatusRecord> {
  const response = await fetchWithAuth('/api/status', user, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });

  return parseJsonResponse(response, 'Failed to update trainer status');
}

export async function fetchTrainerStatus(
  trainerId: string,
  user: AuthUser,
): Promise<TrainerStatusRecord> {
  const response = await fetchWithAuth(
    `/api/status/trainer/${trainerId}`,
    user,
  );
  return parseJsonResponse(response, 'Failed to fetch trainer status');
}
