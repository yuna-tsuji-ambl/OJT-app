import type { MessageAnnouncement } from '@ojt-app/shared';
import { ensureConversationParticipant } from '../domain/authorization.js';
import {
  MessageAnnouncementInvalidInputError,
  MessageAnnouncementNotFoundError,
  MessageAnnouncementTargetNotFoundError,
  MessageThreadNotFoundError,
} from '../domain/errors.js';
import type { UserContext } from '../domain/types.js';
import {
  buildMemoTooLongMessage,
  isMemoWithinMaxLength,
  normalizeOptionalMemo,
} from '../domain/messageMemo.js';
import type { MessageAnnouncementRepository } from '../repositories/messageAnnouncementRepository.js';
import type { MessageThreadStore } from '../repositories/messageThreadStore.js';
import type { ThreadChatMessageStore } from '../repositories/threadChatMessageStore.js';
import { buildMessageAnnouncementId } from './messageAnnouncementIds.js';

export interface CreateMessageAnnouncementInput {
  threadId: string;
  messageId: string;
}

export interface UpdateMessageAnnouncementMemoInput {
  memo: string;
}

export interface MessageAnnouncementDeps {
  announcementRepository: MessageAnnouncementRepository;
  threadStore: MessageThreadStore;
  messageStore: ThreadChatMessageStore;
}

async function assertCanAccessThread(
  context: UserContext,
  threadId: string,
  deps: MessageAnnouncementDeps,
): Promise<void> {
  const thread = await deps.threadStore.getById(threadId);
  if (!thread) {
    throw new MessageThreadNotFoundError(threadId);
  }
  ensureConversationParticipant(context, thread.trainerId, thread.traineeId);
}

async function enrichMessageAnnouncements(
  announcements: MessageAnnouncement[],
  deps: MessageAnnouncementDeps,
): Promise<MessageAnnouncement[]> {
  const threadIds = [
    ...new Set(
      announcements
        .filter(
          (announcement) =>
            !announcement.content ||
            !announcement.senderId ||
            !announcement.messageCreatedAt,
        )
        .map((announcement) => announcement.threadId),
    ),
  ];

  const messagesById = new Map<
    string,
    { content: string; senderId: string; createdAt: string }
  >();
  await Promise.all(
    threadIds.map(async (threadId) => {
      const messages = await deps.messageStore.listByThreadId(threadId);
      for (const message of messages) {
        messagesById.set(message.id, {
          content: message.content,
          senderId: message.senderId,
          createdAt: message.createdAt,
        });
      }
    }),
  );

  return announcements.map((announcement) => {
    const source = messagesById.get(announcement.messageId);
    if (!source) {
      return announcement;
    }
    return {
      ...announcement,
      content: announcement.content ?? source.content,
      senderId: announcement.senderId ?? source.senderId,
      messageCreatedAt: announcement.messageCreatedAt ?? source.createdAt,
    };
  });
}

export async function listMessageAnnouncementsCommand(
  context: UserContext,
  deps: MessageAnnouncementDeps,
): Promise<MessageAnnouncement[]> {
  const all = await deps.announcementRepository.findAll();
  const visible: MessageAnnouncement[] = [];

  for (const announcement of all) {
    const thread = await deps.threadStore.getById(announcement.threadId);
    if (!thread) {
      continue;
    }
    const isParticipant =
      context.userId === thread.trainerId ||
      context.userId === thread.traineeId;
    if (isParticipant) {
      visible.push(announcement);
    }
  }

  const enriched = await enrichMessageAnnouncements(visible, deps);
  return enriched.sort((left, right) =>
    right.createdAt.localeCompare(left.createdAt),
  );
}

export async function createMessageAnnouncementCommand(
  input: CreateMessageAnnouncementInput,
  context: UserContext,
  deps: MessageAnnouncementDeps,
): Promise<MessageAnnouncement> {
  if (!input.threadId || !input.messageId) {
    throw new MessageAnnouncementInvalidInputError();
  }

  await assertCanAccessThread(context, input.threadId, deps);

  const messages = await deps.messageStore.listByThreadId(input.threadId);
  const message = messages.find((item) => item.id === input.messageId);
  if (!message) {
    throw new MessageAnnouncementTargetNotFoundError(input.messageId);
  }

  const id = buildMessageAnnouncementId(input.messageId);
  const existing = await deps.announcementRepository.findById(id);
  if (existing) {
    const needsContent = !existing.content && message.content;
    const needsSender = !existing.senderId && message.senderId;
    const needsMessageCreatedAt =
      !existing.messageCreatedAt && message.createdAt;
    if (!needsContent && !needsSender && !needsMessageCreatedAt) {
      return existing;
    }
    return deps.announcementRepository.save({
      ...existing,
      content: existing.content ?? message.content,
      senderId: existing.senderId ?? message.senderId,
      messageCreatedAt: existing.messageCreatedAt ?? message.createdAt,
    });
  }

  const announcement: MessageAnnouncement = {
    id,
    threadId: input.threadId,
    messageId: input.messageId,
    announcedByUserId: context.userId,
    announcedByRole: context.role,
    senderId: message.senderId,
    content: message.content,
    messageCreatedAt: message.createdAt,
    createdAt: new Date().toISOString(),
  };

  return deps.announcementRepository.save(announcement);
}

export async function deleteMessageAnnouncementCommand(
  announcementId: string,
  context: UserContext,
  deps: MessageAnnouncementDeps,
): Promise<void> {
  const announcement =
    await deps.announcementRepository.findById(announcementId);
  if (!announcement) {
    throw new MessageAnnouncementNotFoundError(announcementId);
  }
  await assertCanAccessThread(context, announcement.threadId, deps);
  await deps.announcementRepository.delete(announcementId);
}

export async function updateMessageAnnouncementMemoCommand(
  announcementId: string,
  input: UpdateMessageAnnouncementMemoInput,
  context: UserContext,
  deps: MessageAnnouncementDeps,
): Promise<MessageAnnouncement> {
  if (!isMemoWithinMaxLength(input.memo)) {
    throw new MessageAnnouncementInvalidInputError(buildMemoTooLongMessage());
  }

  const announcement =
    await deps.announcementRepository.findById(announcementId);
  if (!announcement) {
    throw new MessageAnnouncementNotFoundError(announcementId);
  }
  await assertCanAccessThread(context, announcement.threadId, deps);

  return deps.announcementRepository.save({
    ...announcement,
    memo: normalizeOptionalMemo(input.memo),
  });
}

/** トーク本体削除時（将来の delete API から呼ぶ） */
export async function cascadeDeleteAnnouncementsForThread(
  threadId: string,
  announcementRepository: MessageAnnouncementRepository,
): Promise<number> {
  return announcementRepository.deleteByThreadId(threadId);
}

/** メッセージ本体削除時（将来の delete API から呼ぶ） */
export async function cascadeDeleteAnnouncementsForMessage(
  messageId: string,
  announcementRepository: MessageAnnouncementRepository,
): Promise<number> {
  return announcementRepository.deleteByMessageId(messageId);
}
