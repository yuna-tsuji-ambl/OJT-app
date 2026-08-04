import type { DocumentData } from '@google-cloud/firestore';
import type { MessageBookmark } from '@ojt-app/shared';

export function toMessageBookmarkDocument(
  bookmark: MessageBookmark,
): Record<string, unknown> {
  return {
    id: bookmark.id,
    ownerUserId: bookmark.ownerUserId,
    targetType: bookmark.targetType,
    threadId: bookmark.threadId,
    messageId: bookmark.messageId ?? null,
    senderId: bookmark.senderId ?? null,
    content: bookmark.content ?? null,
    messageCreatedAt: bookmark.messageCreatedAt ?? null,
    memo: bookmark.memo ?? null,
    createdAt: bookmark.createdAt,
  };
}

export function fromMessageBookmarkDocument(
  data: DocumentData | undefined,
): MessageBookmark {
  if (!data) {
    throw new Error('Message bookmark document is empty');
  }

  return {
    id: String(data.id),
    ownerUserId: String(data.ownerUserId),
    targetType: data.targetType === 'message' ? 'message' : 'thread',
    threadId: String(data.threadId),
    messageId:
      typeof data.messageId === 'string' && data.messageId.length > 0
        ? data.messageId
        : undefined,
    senderId:
      typeof data.senderId === 'string' && data.senderId.length > 0
        ? data.senderId
        : undefined,
    content:
      typeof data.content === 'string' && data.content.length > 0
        ? data.content
        : undefined,
    messageCreatedAt:
      typeof data.messageCreatedAt === 'string' &&
      data.messageCreatedAt.length > 0
        ? data.messageCreatedAt
        : undefined,
    memo:
      typeof data.memo === 'string' && data.memo.length > 0
        ? data.memo
        : undefined,
    createdAt: String(data.createdAt),
  };
}
