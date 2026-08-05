import type { MessageBookmark } from '@ojt-app/shared';

export interface MessageBookmarkRepository {
  findByOwnerUserId(
    ownerUserId: string,
    targetType?: MessageBookmark['targetType'],
  ): Promise<MessageBookmark[]>;
  findById(bookmarkId: string): Promise<MessageBookmark | null>;
  save(bookmark: MessageBookmark): Promise<MessageBookmark>;
  delete(bookmarkId: string): Promise<void>;
  /** 本体削除時のカスケード用（BR-BM05） */
  deleteByThreadId(threadId: string): Promise<number>;
  deleteByMessageId(messageId: string): Promise<number>;
}
