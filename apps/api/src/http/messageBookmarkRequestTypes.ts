import type { MessageBookmarkTargetType } from '@ojt-app/shared';
import type {
  CreateMessageBookmarkInput,
  UpdateMessageBookmarkMemoInput,
} from '../messageBookmarks/messageBookmarkCommands.js';
import { parseUpdateMemoBody } from './memoRequestTypes.js';

export function parseCreateMessageBookmarkBody(
  body: unknown,
): CreateMessageBookmarkInput | null {
  if (typeof body !== 'object' || body === null) {
    return null;
  }

  if (!('targetType' in body) || !('threadId' in body)) {
    return null;
  }

  const targetType = body.targetType;
  const threadId = body.threadId;

  if (
    (targetType !== 'thread' && targetType !== 'message') ||
    typeof threadId !== 'string' ||
    threadId.length === 0
  ) {
    return null;
  }

  const messageId =
    'messageId' in body && typeof body.messageId === 'string'
      ? body.messageId
      : undefined;

  if (targetType === 'message' && (!messageId || messageId.length === 0)) {
    return null;
  }

  return {
    targetType,
    threadId,
    messageId,
  };
}

export function parseListMessageBookmarksQuery(
  query: Record<string, unknown>,
): MessageBookmarkTargetType | undefined | null {
  if (!('targetType' in query) || query.targetType === undefined) {
    return undefined;
  }

  if (query.targetType === 'thread' || query.targetType === 'message') {
    return query.targetType;
  }

  return null;
}

export function parseUpdateMessageBookmarkMemoBody(
  body: unknown,
): UpdateMessageBookmarkMemoInput | null {
  return parseUpdateMemoBody(body);
}
