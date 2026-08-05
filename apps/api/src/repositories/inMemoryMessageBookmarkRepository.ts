import type { MessageBookmark } from '@ojt-app/shared';
import type { MessageBookmarkRepository } from './messageBookmarkRepository.js';

function cloneBookmark(bookmark: MessageBookmark): MessageBookmark {
  return { ...bookmark };
}

export class InMemoryMessageBookmarkRepository implements MessageBookmarkRepository {
  private readonly bookmarksById = new Map<string, MessageBookmark>();

  async findByOwnerUserId(
    ownerUserId: string,
    targetType?: MessageBookmark['targetType'],
  ): Promise<MessageBookmark[]> {
    return [...this.bookmarksById.values()]
      .filter((bookmark) => {
        if (bookmark.ownerUserId !== ownerUserId) {
          return false;
        }
        if (targetType && bookmark.targetType !== targetType) {
          return false;
        }
        return true;
      })
      .map(cloneBookmark);
  }

  async findById(bookmarkId: string): Promise<MessageBookmark | null> {
    const bookmark = this.bookmarksById.get(bookmarkId);
    return bookmark ? cloneBookmark(bookmark) : null;
  }

  async save(bookmark: MessageBookmark): Promise<MessageBookmark> {
    const stored = cloneBookmark(bookmark);
    this.bookmarksById.set(stored.id, stored);
    return cloneBookmark(stored);
  }

  async delete(bookmarkId: string): Promise<void> {
    this.bookmarksById.delete(bookmarkId);
  }

  async deleteByThreadId(threadId: string): Promise<number> {
    let removed = 0;
    for (const [id, bookmark] of this.bookmarksById) {
      if (bookmark.threadId === threadId) {
        this.bookmarksById.delete(id);
        removed += 1;
      }
    }
    return removed;
  }

  async deleteByMessageId(messageId: string): Promise<number> {
    let removed = 0;
    for (const [id, bookmark] of this.bookmarksById) {
      if (bookmark.messageId === messageId) {
        this.bookmarksById.delete(id);
        removed += 1;
      }
    }
    return removed;
  }
}

export function createInMemoryMessageBookmarkRepository(): MessageBookmarkRepository {
  return new InMemoryMessageBookmarkRepository();
}
