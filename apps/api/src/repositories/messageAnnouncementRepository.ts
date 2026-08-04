import type { MessageAnnouncement } from '@ojt-app/shared';

export interface MessageAnnouncementRepository {
  findAll(): Promise<MessageAnnouncement[]>;
  findById(announcementId: string): Promise<MessageAnnouncement | null>;
  save(announcement: MessageAnnouncement): Promise<MessageAnnouncement>;
  delete(announcementId: string): Promise<void>;
  deleteByThreadId(threadId: string): Promise<number>;
  deleteByMessageId(messageId: string): Promise<number>;
}
