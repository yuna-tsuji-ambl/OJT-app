import { beforeEach, describe, expect, it } from 'vitest';
import type { MessageAnnouncement } from '@ojt-app/shared';
import type { MessageAnnouncementDeps } from '../messageAnnouncement.js';
import { createInMemoryMessagePersistence } from '../repositories/createInMemoryMessagePersistence.js';
import { createInMemoryMessageAnnouncementRepository } from '../repositories/inMemoryMessageAnnouncementRepository.js';
import { invokeMessageAnnouncementRoute } from './messageAnnouncementRouteTestHelpers.js';

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

describe('メッセージアナウンス API', () => {
  let deps: MessageAnnouncementDeps;
  let threadId: string;
  let messageId: string;

  beforeEach(async () => {
    const messagePersistence = createInMemoryMessagePersistence();
    deps = {
      announcementRepository: createInMemoryMessageAnnouncementRepository(),
      threadStore: messagePersistence.threadStore,
      messageStore: messagePersistence.messageStore,
    };

    const thread = await deps.threadStore.create({
      traineeId: 'trainee-1',
      trainerId: 'trainer-1',
    });
    threadId = thread.id;
    messageId = 'msg-announce-1';

    await deps.messageStore.append({
      id: messageId,
      threadId,
      senderId: 'trainee-1',
      receiverId: 'trainer-1',
      content: 'アナウンス対象メッセージ',
      type: 'text',
      createdAt: '2026-08-03T02:00:00.000Z',
    });
  });

  it('I-AN01 postAnnouncement_作成_HTTP201で保存されGETに出る', async () => {
    const created = await invokeMessageAnnouncementRoute(deps, {
      method: 'post',
      path: '/message-announcements',
      body: { threadId, messageId },
      headers: TRAINEE_HEADERS,
    });

    expect(created.statusCode).toBe(201);
    const announcement = created.body as MessageAnnouncement;
    expect(announcement.messageId).toBe(messageId);
    expect(announcement.announcedByUserId).toBe('trainee-1');
    expect(announcement.announcedByRole).toBe('trainee');
    expect(announcement.content).toBe('アナウンス対象メッセージ');
    expect(announcement.senderId).toBe('trainee-1');
    expect(announcement.messageCreatedAt).toBe('2026-08-03T02:00:00.000Z');

    const listed = await invokeMessageAnnouncementRoute(deps, {
      method: 'get',
      path: '/message-announcements',
      headers: TRAINEE_HEADERS,
    });
    expect(listed.statusCode).toBe(200);
    expect(listed.body).toEqual([announcement]);
  });

  it('I-AN02 postIdempotent_同一messageId再POST_既存を返す', async () => {
    const first = await invokeMessageAnnouncementRoute(deps, {
      method: 'post',
      path: '/message-announcements',
      body: { threadId, messageId },
      headers: TRAINEE_HEADERS,
    });
    const firstBody = first.body as MessageAnnouncement;

    const second = await invokeMessageAnnouncementRoute(deps, {
      method: 'post',
      path: '/message-announcements',
      body: { threadId, messageId },
      headers: TRAINER_HEADERS,
    });

    expect(second.statusCode).toBe(201);
    const secondBody = second.body as MessageAnnouncement;
    expect(secondBody.id).toBe(firstBody.id);
    expect(secondBody.announcedByUserId).toBe('trainee-1');

    const listed = await invokeMessageAnnouncementRoute(deps, {
      method: 'get',
      path: '/message-announcements',
      headers: TRAINEE_HEADERS,
    });
    expect((listed.body as MessageAnnouncement[]).length).toBe(1);
  });

  it('I-AN03 listIsShared_相手にも見える', async () => {
    await invokeMessageAnnouncementRoute(deps, {
      method: 'post',
      path: '/message-announcements',
      body: { threadId, messageId },
      headers: TRAINEE_HEADERS,
    });

    const trainerList = await invokeMessageAnnouncementRoute(deps, {
      method: 'get',
      path: '/message-announcements',
      headers: TRAINER_HEADERS,
    });
    expect(trainerList.statusCode).toBe(200);
    const items = trainerList.body as MessageAnnouncement[];
    expect(items).toHaveLength(1);
    expect(items[0]?.messageId).toBe(messageId);
  });

  it('I-AN04 deleteByPeer_相手が解除できる', async () => {
    const created = await invokeMessageAnnouncementRoute(deps, {
      method: 'post',
      path: '/message-announcements',
      body: { threadId, messageId },
      headers: TRAINEE_HEADERS,
    });
    const announcement = created.body as MessageAnnouncement;

    const deleted = await invokeMessageAnnouncementRoute(deps, {
      method: 'delete',
      path: '/message-announcements/:id',
      params: { id: announcement.id },
      headers: TRAINER_HEADERS,
    });
    expect(deleted.statusCode).toBe(204);

    const listed = await invokeMessageAnnouncementRoute(deps, {
      method: 'get',
      path: '/message-announcements',
      headers: TRAINEE_HEADERS,
    });
    expect(listed.body).toEqual([]);
  });

  it('I-AN05 postForeignThread_参加外_HTTP403', async () => {
    const result = await invokeMessageAnnouncementRoute(deps, {
      method: 'post',
      path: '/message-announcements',
      body: { threadId, messageId },
      headers: OTHER_TRAINEE_HEADERS,
    });
    expect(result.statusCode).toBe(403);
  });

  it('I-AN06 getWithoutAuth_未認証_HTTP401', async () => {
    const result = await invokeMessageAnnouncementRoute(deps, {
      method: 'get',
      path: '/message-announcements',
    });
    expect(result.statusCode).toBe(401);
  });

  it('I-AN07 postUnknownMessage_存在しないmessageId_HTTP404', async () => {
    const result = await invokeMessageAnnouncementRoute(deps, {
      method: 'post',
      path: '/message-announcements',
      body: { threadId, messageId: 'missing-message' },
      headers: TRAINEE_HEADERS,
    });
    expect(result.statusCode).toBe(404);
  });

  it('I-AN08 patchMemo_共有メモを参加者双方が更新できる', async () => {
    const created = await invokeMessageAnnouncementRoute(deps, {
      method: 'post',
      path: '/message-announcements',
      body: { threadId, messageId },
      headers: TRAINEE_HEADERS,
    });
    const announcement = created.body as MessageAnnouncement;

    const patched = await invokeMessageAnnouncementRoute(deps, {
      method: 'patch',
      path: '/message-announcements/:id',
      params: { id: announcement.id },
      body: { memo: '共有メモ' },
      headers: TRAINER_HEADERS,
    });
    expect(patched.statusCode).toBe(200);
    expect((patched.body as MessageAnnouncement).memo).toBe('共有メモ');

    const listed = await invokeMessageAnnouncementRoute(deps, {
      method: 'get',
      path: '/message-announcements',
      headers: TRAINEE_HEADERS,
    });
    expect((listed.body as MessageAnnouncement[])[0]?.memo).toBe('共有メモ');
  });
});
