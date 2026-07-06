import type { Quest } from '@ojt-app/shared';
import type { AuthUser } from '../auth/types';
import { fetchWithAuth } from './authHeaders';
import { parseJsonResponse } from './jsonResponse';

export type { Quest };

export async function fetchQuestList(user: AuthUser): Promise<Quest[]> {
  const response = await fetchWithAuth('/api/quests', user);
  return parseJsonResponse(response, 'Failed to fetch quest list');
}

export async function fetchPendingQuests(user: AuthUser): Promise<Quest[]> {
  const response = await fetchWithAuth('/api/quests/pending', user);
  return parseJsonResponse(response, 'Failed to fetch pending quests');
}

export async function requestQuestClear(
  questId: string,
  user: AuthUser,
): Promise<Quest> {
  const response = await fetchWithAuth(`/api/quests/${questId}/request`, user, {
    method: 'POST',
  });
  return parseJsonResponse(response, 'Failed to request quest clear');
}

export async function approveQuest(
  questId: string,
  user: AuthUser,
): Promise<Quest> {
  const response = await fetchWithAuth(`/api/quests/${questId}/approve`, user, {
    method: 'POST',
  });
  return parseJsonResponse(response, 'Failed to approve quest');
}
