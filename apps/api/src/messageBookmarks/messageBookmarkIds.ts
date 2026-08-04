import type { MessageBookmarkTargetType } from '@ojt-app/shared';

export function buildMessageBookmarkId(
  ownerUserId: string,
  targetType: MessageBookmarkTargetType,
  threadId: string,
  messageId?: string,
): string {
  if (targetType === 'message') {
    return `${ownerUserId}_message_${messageId ?? ''}`;
  }
  return `${ownerUserId}_thread_${threadId}`;
}
