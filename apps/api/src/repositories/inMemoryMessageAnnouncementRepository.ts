import type { MessageAnnouncement } from '@ojt-app/shared';
import type { MessageAnnouncementRepository } from './messageAnnouncementRepository.js';

function cloneAnnouncement(
  announcement: MessageAnnouncement,
): MessageAnnouncement {
  return { ...announcement };
}

export class InMemoryMessageAnnouncementRepository implements MessageAnnouncementRepository {
  private readonly announcementsById = new Map<string, MessageAnnouncement>();

  async findAll(): Promise<MessageAnnouncement[]> {
    return [...this.announcementsById.values()].map(cloneAnnouncement);
  }

  async findById(announcementId: string): Promise<MessageAnnouncement | null> {
    const announcement = this.announcementsById.get(announcementId);
    return announcement ? cloneAnnouncement(announcement) : null;
  }

  async save(announcement: MessageAnnouncement): Promise<MessageAnnouncement> {
    const stored = cloneAnnouncement(announcement);
    this.announcementsById.set(stored.id, stored);
    return cloneAnnouncement(stored);
  }

  async delete(announcementId: string): Promise<void> {
    this.announcementsById.delete(announcementId);
  }

  async deleteByThreadId(threadId: string): Promise<number> {
    let removed = 0;
    for (const [id, announcement] of this.announcementsById) {
      if (announcement.threadId === threadId) {
        this.announcementsById.delete(id);
        removed += 1;
      }
    }
    return removed;
  }

  async deleteByMessageId(messageId: string): Promise<number> {
    let removed = 0;
    for (const [id, announcement] of this.announcementsById) {
      if (announcement.messageId === messageId) {
        this.announcementsById.delete(id);
        removed += 1;
      }
    }
    return removed;
  }
}

export function createInMemoryMessageAnnouncementRepository(): MessageAnnouncementRepository {
  return new InMemoryMessageAnnouncementRepository();
}
