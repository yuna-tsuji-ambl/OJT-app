import { beforeEach, describe, expect, it } from 'vitest';
import type { MessageBookmark } from '@ojt-app/shared';
import {
  cascadeDeleteBookmarksForMessage,
  cascadeDeleteBookmarksForThread,
  type MessageBookmarkDeps,
} from '../messageBookmark.js';
import { createInMemoryMessagePersistence } from '../repositories/createInMemoryMessagePersistence.js';
import { createInMemoryMessageBookmarkRepository } from '../repositories/inMemoryMessageBookmarkRepository.js';
import { invokeMessageBookmarkRoute } from './messageBookmarkRouteTestHelpers.js';

const TRAINEE_HEADERS = {
  'x-user-id': 'trainee-1',
  'x-user-role': 'trainee',
};

const TRAINER_HEADERS = {
  'x-user-id': 'trainer-1',
  'x-user-role': 'trainer',
};

const OTHER_TRAINEE_HEADERS = {
  'x-user-id': 'trainee-2',
  'x-user-role': 'trainee',
};

describe('メッセージブックマーク API', () => {
  let deps: MessageBookmarkDeps;
  let threadId: string;
  let messageId: string;
  let otherMessageId: string;

  beforeEach(async () => {
    const messagePersistence = createInMemoryMessagePersistence();
    deps = {
      bookmarkRepository: createInMemoryMessageBookmarkRepository(),
      threadStore: messagePersistence.threadStore,
      messageStore: messagePersistence.messageStore,
    };

    const thread = await deps.threadStore.create({
      traineeId: 'trainee-1',
      trainerId: 'trainer-1',
    });
    threadId = thread.id;

    messageId = 'msg-self-1';
    otherMessageId = 'msg-other-1';

    await deps.messageStore.append({
      id: messageId,
      threadId,
      senderId: 'trainee-1',
      receiverId: 'trainer-1',
      content: '自分のメッセージ',
      type: 'text',
      createdAt: '2026-08-03T01:00:00.000Z',
    });
    await deps.messageStore.append({
      id: otherMessageId,
      threadId,
      senderId: 'trainer-1',
      receiverId: 'trainee-1',
      content: '相手のメッセージ',
      type: 'text',
      createdAt: '2026-08-03T01:01:00.000Z',
    });
  });

  it('I-BM01 postThreadBookmark_トークをBM_HTTP201で保存されGETに出る', async () => {
    const created = await invokeMessageBookmarkRoute(deps, {
      method: 'post',
      path: '/message-bookmarks',
      body: { targetType: 'thread', threadId },
      headers: TRAINEE_HEADERS,
    });

    expect(created.statusCode).toBe(201);
    const bookmark = created.body as MessageBookmark;
    expect(bookmark.targetType).toBe('thread');
    expect(bookmark.threadId).toBe(threadId);
    expect(bookmark.ownerUserId).toBe('trainee-1');

    const listed = await invokeMessageBookmarkRoute(deps, {
      method: 'get',
      path: '/message-bookmarks',
      headers: TRAINEE_HEADERS,
    });
    expect(listed.statusCode).toBe(200);
    expect(listed.body).toEqual([bookmark]);
  });

  it('I-BM02 postMessageBookmark_メッセージをBM_HTTP201で保存される', async () => {
    const created = await invokeMessageBookmarkRoute(deps, {
      method: 'post',
      path: '/message-bookmarks',
      body: {
        targetType: 'message',
        threadId,
        messageId: otherMessageId,
      },
      headers: TRAINEE_HEADERS,
    });

    expect(created.statusCode).toBe(201);
    const bookmark = created.body as MessageBookmark;
    expect(bookmark.targetType).toBe('message');
    expect(bookmark.messageId).toBe(otherMessageId);
    expect(bookmark.content).toBe('相手のメッセージ');
    expect(bookmark.senderId).toBe('trainer-1');
    expect(bookmark.messageCreatedAt).toBe('2026-08-03T01:01:00.000Z');

    const listed = await invokeMessageBookmarkRoute(deps, {
      method: 'get',
      path: '/message-bookmarks',
      query: { targetType: 'message' },
      headers: TRAINEE_HEADERS,
    });
    expect(listed.statusCode).toBe(200);
    const listedBookmark = (listed.body as MessageBookmark[])[0];
    expect(listedBookmark?.content).toBe('相手のメッセージ');
    expect(listedBookmark?.senderId).toBe('trainer-1');
    expect(listedBookmark?.messageCreatedAt).toBe('2026-08-03T01:01:00.000Z');
  });

  it('I-BM03 getWithoutAuth_未認証_HTTP401', async () => {
    const result = await invokeMessageBookmarkRoute(deps, {
      method: 'get',
      path: '/message-bookmarks',
    });
    expect(result.statusCode).toBe(401);
  });

  it('I-BM04 postForeignThread_参加外トーク_HTTP403', async () => {
    const result = await invokeMessageBookmarkRoute(deps, {
      method: 'post',
      path: '/message-bookmarks',
      body: { targetType: 'thread', threadId },
      headers: OTHER_TRAINEE_HEADERS,
    });
    expect(result.statusCode).toBe(403);
  });

  it('I-BM05 postUnknownMessage_存在しないmessageId_HTTP404', async () => {
    const result = await invokeMessageBookmarkRoute(deps, {
      method: 'post',
      path: '/message-bookmarks',
      body: {
        targetType: 'message',
        threadId,
        messageId: 'missing-message',
      },
      headers: TRAINEE_HEADERS,
    });
    expect(result.statusCode).toBe(404);
  });

  it('I-BM06 listIsPersonal_他ユーザーには見えない', async () => {
    await invokeMessageBookmarkRoute(deps, {
      method: 'post',
      path: '/message-bookmarks',
      body: { targetType: 'thread', threadId },
      headers: TRAINEE_HEADERS,
    });

    const trainerList = await invokeMessageBookmarkRoute(deps, {
      method: 'get',
      path: '/message-bookmarks',
      headers: TRAINER_HEADERS,
    });
    expect(trainerList.statusCode).toBe(200);
    expect(trainerList.body).toEqual([]);
  });

  it('I-BM07 cascadeDelete_本体削除相当でBMが消える', async () => {
    await invokeMessageBookmarkRoute(deps, {
      method: 'post',
      path: '/message-bookmarks',
      body: { targetType: 'thread', threadId },
      headers: TRAINEE_HEADERS,
    });
    await invokeMessageBookmarkRoute(deps, {
      method: 'post',
      path: '/message-bookmarks',
      body: {
        targetType: 'message',
        threadId,
        messageId,
      },
      headers: TRAINEE_HEADERS,
    });

    const removedMessages = await cascadeDeleteBookmarksForMessage(
      messageId,
      deps.bookmarkRepository,
    );
    expect(removedMessages).toBe(1);

    let listed = await invokeMessageBookmarkRoute(deps, {
      method: 'get',
      path: '/message-bookmarks',
      headers: TRAINEE_HEADERS,
    });
    expect((listed.body as MessageBookmark[]).map((b) => b.targetType)).toEqual(
      ['thread'],
    );

    const removedThreads = await cascadeDeleteBookmarksForThread(
      threadId,
      deps.bookmarkRepository,
    );
    expect(removedThreads).toBe(1);

    listed = await invokeMessageBookmarkRoute(deps, {
      method: 'get',
      path: '/message-bookmarks',
      headers: TRAINEE_HEADERS,
    });
    expect(listed.body).toEqual([]);
  });

  it('U-BM deleteBookmark_所有者のみ解除できる', async () => {
    const created = await invokeMessageBookmarkRoute(deps, {
      method: 'post',
      path: '/message-bookmarks',
      body: { targetType: 'thread', threadId },
      headers: TRAINEE_HEADERS,
    });
    const bookmark = created.body as MessageBookmark;

    const forbidden = await invokeMessageBookmarkRoute(deps, {
      method: 'delete',
      path: '/message-bookmarks/:id',
      params: { id: bookmark.id },
      headers: TRAINER_HEADERS,
    });
    expect(forbidden.statusCode).toBe(403);

    const deleted = await invokeMessageBookmarkRoute(deps, {
      method: 'delete',
      path: '/message-bookmarks/:id',
      params: { id: bookmark.id },
      headers: TRAINEE_HEADERS,
    });
    expect(deleted.statusCode).toBe(204);
  });

  it('U-BM14 postOtherMessage_相手吹き出しもBMできる', async () => {
    const created = await invokeMessageBookmarkRoute(deps, {
      method: 'post',
      path: '/message-bookmarks',
      body: {
        targetType: 'message',
        threadId,
        messageId: otherMessageId,
      },
      headers: TRAINEE_HEADERS,
    });
    expect(created.statusCode).toBe(201);
  });

  it('U-BM16 postSelfMessage_自分吹き出しもBMできる', async () => {
    const created = await invokeMessageBookmarkRoute(deps, {
      method: 'post',
      path: '/message-bookmarks',
      body: {
        targetType: 'message',
        threadId,
        messageId,
      },
      headers: TRAINER_HEADERS,
    });
    expect(created.statusCode).toBe(201);
  });

  it('二重POST_幂等で1件のまま', async () => {
    await invokeMessageBookmarkRoute(deps, {
      method: 'post',
      path: '/message-bookmarks',
      body: { targetType: 'thread', threadId },
      headers: TRAINEE_HEADERS,
    });
    await invokeMessageBookmarkRoute(deps, {
      method: 'post',
      path: '/message-bookmarks',
      body: { targetType: 'thread', threadId },
      headers: TRAINEE_HEADERS,
    });

    const listed = await invokeMessageBookmarkRoute(deps, {
      method: 'get',
      path: '/message-bookmarks',
      query: { targetType: 'thread' },
      headers: TRAINEE_HEADERS,
    });
    expect((listed.body as MessageBookmark[]).length).toBe(1);
  });

  it('I-BM08 patchMemo_メッセージBMにメモを保存できる', async () => {
    const created = await invokeMessageBookmarkRoute(deps, {
      method: 'post',
      path: '/message-bookmarks',
      body: {
        targetType: 'message',
        threadId,
        messageId: otherMessageId,
      },
      headers: TRAINEE_HEADERS,
    });
    const bookmark = created.body as MessageBookmark;

    const patched = await invokeMessageBookmarkRoute(deps, {
      method: 'patch',
      path: '/message-bookmarks/:id',
      params: { id: bookmark.id },
      body: { memo: '  振り返りメモ  ' },
      headers: TRAINEE_HEADERS,
    });
    expect(patched.statusCode).toBe(200);
    expect((patched.body as MessageBookmark).memo).toBe('振り返りメモ');

    const listed = await invokeMessageBookmarkRoute(deps, {
      method: 'get',
      path: '/message-bookmarks',
      query: { targetType: 'message' },
      headers: TRAINEE_HEADERS,
    });
    expect((listed.body as MessageBookmark[])[0]?.memo).toBe('振り返りメモ');
  });

  it('I-BM09 patchMemo_所有者以外は403', async () => {
    const created = await invokeMessageBookmarkRoute(deps, {
      method: 'post',
      path: '/message-bookmarks',
      body: {
        targetType: 'message',
        threadId,
        messageId: otherMessageId,
      },
      headers: TRAINEE_HEADERS,
    });
    const bookmark = created.body as MessageBookmark;

    const patched = await invokeMessageBookmarkRoute(deps, {
      method: 'patch',
      path: '/message-bookmarks/:id',
      params: { id: bookmark.id },
      body: { memo: '他人のメモ' },
      headers: TRAINER_HEADERS,
    });
    expect(patched.statusCode).toBe(403);
  });
});
