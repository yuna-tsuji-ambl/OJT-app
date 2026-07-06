import type { AuthUser } from '../auth/types';
import { fetchWithAuth } from './authHeaders';
import { parseJsonResponse } from './jsonResponse';
import type {
  ChatMessage,
  ChatMessageResult,
  TrainerStatusRecord,
} from '../domain/statusTypes';
import type { TrainerStatusType } from '../domain/statusConstants';

export type { ChatMessage, TrainerStatusRecord };

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

export async function fetchChatMessages(
  trainerId: string,
  traineeId: string,
  user: AuthUser,
): Promise<ChatMessage[]> {
  const params = new URLSearchParams({ trainerId, traineeId });
  const response = await fetchWithAuth(
    `/api/status/messages?${params.toString()}`,
    user,
  );

  return parseJsonResponse(response, 'Failed to fetch chat messages');
}

export async function sendQuickQuestion(
  trainerId: string,
  content: string,
  user: AuthUser,
): Promise<ChatMessageResult> {
  const response = await fetchWithAuth('/api/status/messages', user, {
    method: 'POST',
    body: JSON.stringify({ trainerId, content }),
  });

  return parseJsonResponse(response, 'Failed to send quick question');
}

export async function sendQuickReply(
  traineeId: string,
  content: string,
  user: AuthUser,
): Promise<ChatMessageResult> {
  const response = await fetchWithAuth('/api/status/messages', user, {
    method: 'POST',
    body: JSON.stringify({ traineeId, content }),
  });

  return parseJsonResponse(response, 'Failed to send quick reply');
}
