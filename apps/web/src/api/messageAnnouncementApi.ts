import type { MessageAnnouncement } from '@ojt-app/shared';
import type { AuthUser } from '../auth/types';
import { fetchWithAuth } from './authHeaders';
import { throwApiError } from './parseApiError';

const MESSAGE_ANNOUNCEMENTS_API_PATH = '/api/message-announcements';

export async function fetchMessageAnnouncements(
  user: AuthUser,
): Promise<MessageAnnouncement[]> {
  const response = await fetchWithAuth(MESSAGE_ANNOUNCEMENTS_API_PATH, user);
  if (!response.ok) {
    await throwApiError(response, 'アナウンスを取得できませんでした');
  }
  return (await response.json()) as MessageAnnouncement[];
}

export async function createMessageAnnouncement(
  user: AuthUser,
  input: { threadId: string; messageId: string },
): Promise<MessageAnnouncement> {
  const response = await fetchWithAuth(MESSAGE_ANNOUNCEMENTS_API_PATH, user, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    await throwApiError(response, 'アナウンスを追加できませんでした');
  }
  return (await response.json()) as MessageAnnouncement;
}

export async function deleteMessageAnnouncement(
  user: AuthUser,
  announcementId: string,
): Promise<void> {
  const response = await fetchWithAuth(
    `${MESSAGE_ANNOUNCEMENTS_API_PATH}/${announcementId}`,
    user,
    { method: 'DELETE' },
  );
  if (!response.ok) {
    await throwApiError(response, 'アナウンスを解除できませんでした');
  }
}

export async function updateMessageAnnouncementMemo(
  user: AuthUser,
  announcementId: string,
  memo: string,
): Promise<MessageAnnouncement> {
  const response = await fetchWithAuth(
    `${MESSAGE_ANNOUNCEMENTS_API_PATH}/${announcementId}`,
    user,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memo }),
    },
  );
  if (!response.ok) {
    await throwApiError(response, 'メモを保存できませんでした');
  }
  return (await response.json()) as MessageAnnouncement;
}
