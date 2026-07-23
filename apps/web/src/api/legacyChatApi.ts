import type { AuthUser } from '../auth/types';
import type { ChatMessage, ChatMessageResult } from '../domain/statusTypes';
import { fetchWithAuth } from './authHeaders';
import { parseJsonResponse } from './jsonResponse';

const MESSAGES_ENDPOINT = '/api/status/messages';

export async function fetchChatMessages(
  trainerId: string,
  traineeId: string,
  user: AuthUser,
): Promise<ChatMessage[]> {
  const params = new URLSearchParams({ trainerId, traineeId });
  const response = await fetchWithAuth(
    `${MESSAGES_ENDPOINT}?${params.toString()}`,
    user,
  );

  return parseJsonResponse(response, 'Failed to fetch chat messages');
}

export async function sendQuickReply(
  traineeId: string,
  content: string,
  user: AuthUser,
): Promise<ChatMessageResult> {
  const response = await fetchWithAuth(MESSAGES_ENDPOINT, user, {
    method: 'POST',
    body: JSON.stringify({ traineeId, content }),
  });

  return parseJsonResponse(response, 'Failed to send quick reply');
}
