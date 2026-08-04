import type {
  MessageBookmark,
  MessageBookmarkTargetType,
} from '@ojt-app/shared';
import type { AuthUser } from '../auth/types';
import { fetchWithAuth } from './authHeaders';
import { throwApiError } from './parseApiError';

const MESSAGE_BOOKMARKS_API_PATH = '/api/message-bookmarks';

export async function fetchMessageBookmarks(
  user: AuthUser,
  targetType?: MessageBookmarkTargetType,
): Promise<MessageBookmark[]> {
  const query = targetType
    ? `?${new URLSearchParams({ targetType }).toString()}`
    : '';
  const response = await fetchWithAuth(
    `${MESSAGE_BOOKMARKS_API_PATH}${query}`,
    user,
  );
  if (!response.ok) {
    await throwApiError(response, 'ブックマークを取得できませんでした');
  }
  return (await response.json()) as MessageBookmark[];
}

export async function createMessageBookmark(
  user: AuthUser,
  input: {
    targetType: MessageBookmarkTargetType;
    threadId: string;
    messageId?: string;
  },
): Promise<MessageBookmark> {
  const response = await fetchWithAuth(MESSAGE_BOOKMARKS_API_PATH, user, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    await throwApiError(response, 'ブックマークを追加できませんでした');
  }
  return (await response.json()) as MessageBookmark;
}

export async function deleteMessageBookmark(
  user: AuthUser,
  bookmarkId: string,
): Promise<void> {
  const response = await fetchWithAuth(
    `${MESSAGE_BOOKMARKS_API_PATH}/${bookmarkId}`,
    user,
    { method: 'DELETE' },
  );
  if (!response.ok) {
    await throwApiError(response, 'ブックマークを解除できませんでした');
  }
}

export async function updateMessageBookmarkMemo(
  user: AuthUser,
  bookmarkId: string,
  memo: string,
): Promise<MessageBookmark> {
  const response = await fetchWithAuth(
    `${MESSAGE_BOOKMARKS_API_PATH}/${bookmarkId}`,
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
  return (await response.json()) as MessageBookmark;
}
