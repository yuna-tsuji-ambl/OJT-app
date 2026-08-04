import type { MessageBookmark } from '@ojt-app/shared';
import { ensureConversationParticipant } from '../domain/authorization.js';
import {
  ForbiddenError,
  MessageBookmarkInvalidInputError,
  MessageBookmarkNotFoundError,
  MessageBookmarkTargetNotFoundError,
  MessageThreadNotFoundError,
} from '../domain/errors.js';
import type { UserContext } from '../domain/types.js';
import {
  buildMemoTooLongMessage,
  isMemoWithinMaxLength,
  normalizeOptionalMemo,
} from '../domain/messageMemo.js';
import type { MessageBookmarkRepository } from '../repositories/messageBookmarkRepository.js';
import type { MessageThreadStore } from '../repositories/messageThreadStore.js';
import type { ThreadChatMessageStore } from '../repositories/threadChatMessageStore.js';
import { buildMessageBookmarkId } from './messageBookmarkIds.js';

export interface CreateMessageBookmarkInput {
  targetType: MessageBookmark['targetType'];
  threadId: string;
  messageId?: string;
}

export interface UpdateMessageBookmarkMemoInput {
  memo: string;
}

export interface MessageBookmarkDeps {
  bookmarkRepository: MessageBookmarkRepository;
  threadStore: MessageThreadStore;
  messageStore: ThreadChatMessageStore;
}

async function assertCanBookmarkThread(
  context: UserContext,
  threadId: string,
  deps: MessageBookmarkDeps,
): Promise<void> {
  const thread = await deps.threadStore.getById(threadId);
  if (!thread) {
    throw new MessageThreadNotFoundError(threadId);
  }
  ensureConversationParticipant(context, thread.trainerId, thread.traineeId);
}

async function enrichMessageBookmarks(
  bookmarks: MessageBookmark[],
  deps: MessageBookmarkDeps,
): Promise<MessageBookmark[]> {
  const threadIds = [
    ...new Set(
      bookmarks
        .filter(
          (bookmark) =>
            bookmark.targetType === 'message' &&
            bookmark.messageId &&
            (!bookmark.content ||
              !bookmark.senderId ||
              !bookmark.messageCreatedAt),
        )
        .map((bookmark) => bookmark.threadId),
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

  return bookmarks.map((bookmark) => {
    if (bookmark.targetType !== 'message' || !bookmark.messageId) {
      return bookmark;
    }
    const source = messagesById.get(bookmark.messageId);
    if (!source) {
      return bookmark;
    }
    return {
      ...bookmark,
      content: bookmark.content ?? source.content,
      senderId: bookmark.senderId ?? source.senderId,
      messageCreatedAt: bookmark.messageCreatedAt ?? source.createdAt,
    };
  });
}

export async function listMessageBookmarksCommand(
  context: UserContext,
  targetType: MessageBookmark['targetType'] | undefined,
  deps: MessageBookmarkDeps,
): Promise<MessageBookmark[]> {
  const bookmarks = await deps.bookmarkRepository.findByOwnerUserId(
    context.userId,
    targetType,
  );
  const enriched = await enrichMessageBookmarks(bookmarks, deps);
  return enriched.sort((left, right) =>
    right.createdAt.localeCompare(left.createdAt),
  );
}

export async function createMessageBookmarkCommand(
  input: CreateMessageBookmarkInput,
  context: UserContext,
  deps: MessageBookmarkDeps,
): Promise<MessageBookmark> {
  if (input.targetType === 'message' && !input.messageId) {
    throw new MessageBookmarkInvalidInputError();
  }

  await assertCanBookmarkThread(context, input.threadId, deps);

  let messageContent: string | undefined;
  let messageSenderId: string | undefined;
  let messageCreatedAt: string | undefined;
  if (input.targetType === 'message' && input.messageId) {
    const messages = await deps.messageStore.listByThreadId(input.threadId);
    const message = messages.find((item) => item.id === input.messageId);
    if (!message) {
      throw new MessageBookmarkTargetNotFoundError(input.messageId);
    }
    messageContent = message.content;
    messageSenderId = message.senderId;
    messageCreatedAt = message.createdAt;
  }

  const id = buildMessageBookmarkId(
    context.userId,
    input.targetType,
    input.threadId,
    input.messageId,
  );
  const existing = await deps.bookmarkRepository.findById(id);
  if (existing) {
    const needsContent = !existing.content && messageContent;
    const needsSender = !existing.senderId && messageSenderId;
    const needsMessageCreatedAt =
      !existing.messageCreatedAt && messageCreatedAt;
    if (!needsContent && !needsSender && !needsMessageCreatedAt) {
      return existing;
    }
    return deps.bookmarkRepository.save({
      ...existing,
      content: existing.content ?? messageContent,
      senderId: existing.senderId ?? messageSenderId,
      messageCreatedAt: existing.messageCreatedAt ?? messageCreatedAt,
    });
  }

  const bookmark: MessageBookmark = {
    id,
    ownerUserId: context.userId,
    targetType: input.targetType,
    threadId: input.threadId,
    messageId: input.targetType === 'message' ? input.messageId : undefined,
    senderId: messageSenderId,
    content: messageContent,
    messageCreatedAt,
    createdAt: new Date().toISOString(),
  };

  return deps.bookmarkRepository.save(bookmark);
}

export async function deleteMessageBookmarkCommand(
  bookmarkId: string,
  context: UserContext,
  deps: MessageBookmarkDeps,
): Promise<void> {
  const bookmark = await deps.bookmarkRepository.findById(bookmarkId);
  if (!bookmark) {
    throw new MessageBookmarkNotFoundError(bookmarkId);
  }
  if (bookmark.ownerUserId !== context.userId) {
    throw new ForbiddenError();
  }
  await deps.bookmarkRepository.delete(bookmarkId);
}

export async function updateMessageBookmarkMemoCommand(
  bookmarkId: string,
  input: UpdateMessageBookmarkMemoInput,
  context: UserContext,
  deps: MessageBookmarkDeps,
): Promise<MessageBookmark> {
  if (!isMemoWithinMaxLength(input.memo)) {
    throw new MessageBookmarkInvalidInputError(buildMemoTooLongMessage());
  }

  const bookmark = await deps.bookmarkRepository.findById(bookmarkId);
  if (!bookmark) {
    throw new MessageBookmarkNotFoundError(bookmarkId);
  }
  if (bookmark.ownerUserId !== context.userId) {
    throw new ForbiddenError();
  }
  if (bookmark.targetType !== 'message') {
    throw new MessageBookmarkInvalidInputError(
      'Memo is only supported for message bookmarks',
    );
  }

  return deps.bookmarkRepository.save({
    ...bookmark,
    memo: normalizeOptionalMemo(input.memo),
  });
}

/** トーク本体削除時（将来の delete API から呼ぶ） */
export async function cascadeDeleteBookmarksForThread(
  threadId: string,
  bookmarkRepository: MessageBookmarkRepository,
): Promise<number> {
  return bookmarkRepository.deleteByThreadId(threadId);
}

/** メッセージ本体削除時（将来の delete API から呼ぶ） */
export async function cascadeDeleteBookmarksForMessage(
  messageId: string,
  bookmarkRepository: MessageBookmarkRepository,
): Promise<number> {
  return bookmarkRepository.deleteByMessageId(messageId);
}
