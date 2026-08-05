import type { DocumentData } from '@google-cloud/firestore';
import type { MessageAnnouncement, UserRole } from '@ojt-app/shared';

function toOptionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function toUserRole(value: unknown): UserRole {
  return value === 'trainer' ? 'trainer' : 'trainee';
}

export function toMessageAnnouncementDocument(
  announcement: MessageAnnouncement,
): Record<string, unknown> {
  return {
    id: announcement.id,
    threadId: announcement.threadId,
    messageId: announcement.messageId,
    announcedByUserId: announcement.announcedByUserId,
    announcedByRole: announcement.announcedByRole,
    senderId: announcement.senderId ?? null,
    content: announcement.content ?? null,
    messageCreatedAt: announcement.messageCreatedAt ?? null,
    memo: announcement.memo ?? null,
    createdAt: announcement.createdAt,
  };
}

export function fromMessageAnnouncementDocument(
  data: DocumentData | undefined,
): MessageAnnouncement {
  if (!data) {
    throw new Error('Message announcement document is empty');
  }

  return {
    id: String(data.id),
    threadId: String(data.threadId),
    messageId: String(data.messageId),
    announcedByUserId: String(data.announcedByUserId),
    announcedByRole: toUserRole(data.announcedByRole),
    senderId: toOptionalString(data.senderId),
    content: toOptionalString(data.content),
    messageCreatedAt: toOptionalString(data.messageCreatedAt),
    memo: toOptionalString(data.memo),
    createdAt: String(data.createdAt),
  };
}
