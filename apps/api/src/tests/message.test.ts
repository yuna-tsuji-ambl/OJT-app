import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  listMessageThreads,
  listThreadChatMessages,
  sendTrainerStampReply,
  sendTrainerTemplateMessage,
  sendTrainerTemplateReply,
  sendTrainerTextReply,
  sendTraineeStampReply,
  sendTraineeTemplateMessage,
  sendTraineeTextMessage,
  sendTrainerLegacyFlatReply,
  ForbiddenError,
  LegacyQuickReplyNotSupportedError,
  LEGACY_QUICK_REPLY_CONTENT,
  MessageContentRequiredError,
  MessageTemplateRequiredError,
  MessageThreadNotFoundError,
  QUESTION_TEMPLATE_TQ1_CONTENT,
  QUESTION_TEMPLATE_TQ1_ID,
  REPLY_TEMPLATE_TT2_CONTENT,
  REPLY_TEMPLATE_TT2_ID,
  REPLY_TEMPLATE_TT4_CONTENT,
  REPLY_TEMPLATE_TT4_ID,
  STAMP_ST1_CONTENT,
  STAMP_ST1_ID,
  TRAINEE_STAMP_STS2_CONTENT,
  TRAINEE_STAMP_STS2_ID,
  type MessageThreadListItem,
  type MessageThreadStore,
  type SendTemplateMessageResult,
  type SendTextMessageResult,
  type SendTrainerStampReplyResult,
  type SendTrainerTemplateMessageResult,
  type SendTrainerTemplateReplyResult,
  type SendTrainerTextReplyResult,
  type SendTraineeStampReplyResult,
  type ThreadChatMessage,
  type ThreadChatMessageStore,
  createMessageRealtimeHub,
  createMessageUpdatePoller,
  MESSAGE_UPDATE_POLL_INTERVAL_MS,
  FIRESTORE_COLLECTIONS,
  syncMissedMessageUpdates,
  type MessageRealtimeHub,
  type MessageUpdateEvent,
} from '../message.js';
import {
  QUESTION_TEMPLATE_TQ2_CONTENT,
  QUESTION_TEMPLATE_TQ2_ID,
  QUESTION_TEMPLATE_TQ3_CONTENT,
  QUESTION_TEMPLATE_TQ3_ID,
  QUESTION_TEMPLATE_TQ4_CONTENT,
  QUESTION_TEMPLATE_TQ4_ID,
  QUESTION_TEMPLATE_TQ5_CONTENT,
  QUESTION_TEMPLATE_TQ5_ID,
} from '../domain/messageConstants.js';
import {
  isThreadHistoryViewportAnchored,
  selectThreadViewportAnchorMessage,
} from '../domain/messageThreadViewport.js';
import {
  FIRST_MESSAGE_THREAD_LIST_PAGE,
  MESSAGE_THREAD_LIST_PAGE_SIZE,
  applyMessageThreadSelection,
  applyInlineMessageThreadDetailSelection,
  isEmptyPaginatedMessageThreads,
  isInlineThreadDetailOpen,
  isInlineMessageThreadRowSelected,
  paginateMessageThreads,
  resolveInlineMessageThreadDetailState,
  resolveInlineThreadSelection,
  selectInlineMessageThread,
  shouldClearInlineMessageThreadDetailOnThreadCountIncrease,
  shouldCloseInlineThreadSelection,
  shouldSwitchInlineThreadSelection,
  MESSAGE_THREAD_INLINE_DETAIL_CLOSED_STATE,
  MESSAGE_THREAD_INLINE_DETAIL_OPEN_STATE,
} from '@ojt-app/shared';
import { resetFirestoreForTests } from '../firestore/client.js';
import { prepareFirestoreMessageTestEnvironment } from '../repositories/firestore/firestoreMessageTestSupport.js';
import { reconnectFirestoreMessagePersistence } from '../repositories/reconnectFirestoreMessagePersistence.js';
import { InMemoryMessageThreadStore } from '../repositories/inMemoryMessageThreadStore.js';
import { InMemoryThreadChatMessageStore } from '../repositories/inMemoryThreadChatMessageStore.js';
import {
  createFirestoreMessageTestStores,
  findMessageThreadListItem,
  sendIm02Conversation,
  sendIm04TwoNewThreads,
  sendTraineeTq1NewThread,
} from './messageFirestoreTestHelpers.js';
import {
  MOCK_MESSAGE_THREAD as CREATED_THREAD,
  U_M19_REALISTIC_THREAD_ID,
  U_M19_THREAD_A,
  U_M21_THREAD_B,
  U_M23_TRAINEE_USER,
  U_M23_THREAD_SELECTION_CASES,
  U_M24_INLINE_DESELECT_CASES,
  buildR_M17_THREAD_ID,
  createMessageThreadSelectionMocks,
  createMockMessageThreadStore,
  createR_M17_THREAD_LIST,
  expectThreadWithLatestActivity,
} from './messageTestHelpers.js';

const TRAINEE_USER_ID = 'trainee-1';
const TRAINER_USER_ID = 'trainer-1';
const UNASSIGNED_TRAINER_USER_ID = 'trainer-2';
const THIRD_PARTY_USER_ID = 'other-user-1';
const INVALID_THREAD_ID = 'thread-not-found';
const U_M02_FREE_TEXT_CONTENT = 'APIの設計について質問です';
const U_M05_FREE_TEXT_CONTENT = '15時に声をかけてください';
const I_M04_SECOND_MESSAGE_CONTENT = 'レビューをお願いしたいです';
const I_M05_FIRST_SENT_AT = new Date('2026-07-22T05:00:00.000Z');
const I_M05_SECOND_SENT_AT = new Date('2026-07-22T05:00:05.000Z');
const I_M05_SECOND_MESSAGE_CONTENT = 'わからないことがあるので教えてください';

/**
 * U-M01: 新卒がテンプレートで新規メッセージ送信
 *
 * 前提条件: 新卒コンテキスト、`trainer-1` との会話なし
 * アクション: テンプレート TQ1 を選択して送信（`POST /api/status/messages` 相当）
 * 期待結果: 新規 `threadId` が発行され、`type: template` のメッセージが保存されること
 *
 * 結合境界: messageFacade → messageService → MessageThreadStore / ThreadChatMessageStore
 * （本ケースはストアをモックした単体テスト。HTTP 層は対象外）
 */
describe('U-M01 新卒がテンプレートで新規メッセージ送信', () => {
  let threadStore: MessageThreadStore;
  let messageStore: ThreadChatMessageStore;

  beforeEach(() => {
    threadStore = createMockMessageThreadStore({ getById: vi.fn() });
    messageStore = {
      append: vi.fn().mockResolvedValue(undefined),
      listByThreadId: vi.fn().mockResolvedValue([]),
    };
  });

  it('sendTraineeTemplateMessage_新卒TQ1送信_新規スレッドとtemplateメッセージが保存される', async () => {
    const result: SendTemplateMessageResult = await sendTraineeTemplateMessage(
      {
        templateId: QUESTION_TEMPLATE_TQ1_ID,
        trainerId: TRAINER_USER_ID,
      },
      TRAINEE_USER_ID,
      'trainee',
      threadStore,
      messageStore,
    );

    expect(threadStore.create).toHaveBeenCalledWith({
      traineeId: TRAINEE_USER_ID,
      trainerId: TRAINER_USER_ID,
    });

    const expectedMessageFields = {
      threadId: CREATED_THREAD.id,
      senderId: TRAINEE_USER_ID,
      receiverId: TRAINER_USER_ID,
      content: QUESTION_TEMPLATE_TQ1_CONTENT,
      type: 'template' as const,
      templateId: QUESTION_TEMPLATE_TQ1_ID,
    };

    expect(messageStore.append).toHaveBeenCalledWith(
      expect.objectContaining(expectedMessageFields),
    );

    expectThreadWithLatestActivity(result.thread, result.message);
    expect(result.message).toMatchObject(expectedMessageFields);
    expect(result.message.id).toEqual(expect.any(String));
    expect(result.message.createdAt).toEqual(expect.any(String));
    expect(result.message.threadId).toBe(CREATED_THREAD.id);
    expect(result.message.type).toBe('template');
    expect(result.message.templateId).toBe(QUESTION_TEMPLATE_TQ1_ID);
  });
});

/**
 * U-M02: 新卒が自由記述で新規メッセージ送信
 *
 * 前提条件: 新卒コンテキスト
 * アクション: 自由記述「APIの設計について質問です」を送信（`POST /api/status/messages` 相当）
 * 期待結果: 新規スレッドが作成され、`type: text`・`content` がそのまま保存されること
 */
describe('U-M02 新卒が自由記述で新規メッセージ送信', () => {
  let threadStore: MessageThreadStore;
  let messageStore: ThreadChatMessageStore;

  beforeEach(() => {
    threadStore = createMockMessageThreadStore({ getById: vi.fn() });
    messageStore = {
      append: vi.fn().mockResolvedValue(undefined),
      listByThreadId: vi.fn().mockResolvedValue([]),
    };
  });

  it('sendTraineeTextMessage_新卒自由記述送信_新規スレッドとtextメッセージが保存される', async () => {
    const result: SendTextMessageResult = await sendTraineeTextMessage(
      {
        content: U_M02_FREE_TEXT_CONTENT,
        trainerId: TRAINER_USER_ID,
      },
      TRAINEE_USER_ID,
      'trainee',
      threadStore,
      messageStore,
    );

    expect(threadStore.create).toHaveBeenCalledWith({
      traineeId: TRAINEE_USER_ID,
      trainerId: TRAINER_USER_ID,
    });

    const expectedMessageFields = {
      threadId: CREATED_THREAD.id,
      senderId: TRAINEE_USER_ID,
      receiverId: TRAINER_USER_ID,
      content: U_M02_FREE_TEXT_CONTENT,
      type: 'text' as const,
    };

    expect(messageStore.append).toHaveBeenCalledWith(
      expect.objectContaining(expectedMessageFields),
    );

    expectThreadWithLatestActivity(result.thread, result.message);
    expect(result.message).toMatchObject(expectedMessageFields);
    expect(result.message.id).toEqual(expect.any(String));
    expect(result.message.createdAt).toEqual(expect.any(String));
    expect(result.message.threadId).toBe(CREATED_THREAD.id);
    expect(result.message.type).toBe('text');
    expect(result.message.content).toBe(U_M02_FREE_TEXT_CONTENT);
    expect(result.message.templateId).toBeUndefined();
  });
});

/**
 * R-M01: 新卒はホーム画面からテンプレート（ドロップダウン）または自由記述でメッセージを送信できる
 *
 * 機能要件として、新卒向け質問テンプレート TQ1〜TQ5 のいずれか、または自由記述による
 * 新規送信が API 層で成立することを検証する。
 *
 * UI 要件（ドロップダウン 5 件・自由記述入力）は E-M01 / E-M02 で検証。
 * 単体ケース U-M01（TQ1）・U-M02（自由記述）と重複するが、要件 ID 単位の網羅を目的とする。
 *
 * 結合境界: messageFacade → messageService → MessageThreadStore / ThreadChatMessageStore
 */
describe('R-M01 新卒のテンプレートまたは自由記述でのメッセージ送信', () => {
  const R_M01_FREE_TEXT_CONTENT = '相談したいことがあります（自由記述）';

  const R_M01_QUESTION_TEMPLATE_CASES = [
    {
      templateId: QUESTION_TEMPLATE_TQ1_ID,
      content: QUESTION_TEMPLATE_TQ1_CONTENT,
    },
    {
      templateId: QUESTION_TEMPLATE_TQ2_ID,
      content: QUESTION_TEMPLATE_TQ2_CONTENT,
    },
    {
      templateId: QUESTION_TEMPLATE_TQ3_ID,
      content: QUESTION_TEMPLATE_TQ3_CONTENT,
    },
    {
      templateId: QUESTION_TEMPLATE_TQ4_ID,
      content: QUESTION_TEMPLATE_TQ4_CONTENT,
    },
    {
      templateId: QUESTION_TEMPLATE_TQ5_ID,
      content: QUESTION_TEMPLATE_TQ5_CONTENT,
    },
  ] as const;

  let threadStore: MessageThreadStore;
  let messageStore: ThreadChatMessageStore;

  beforeEach(() => {
    threadStore = createMockMessageThreadStore({ getById: vi.fn() });
    messageStore = {
      append: vi.fn().mockResolvedValue(undefined),
      listByThreadId: vi.fn().mockResolvedValue([]),
    };
  });

  it.each(R_M01_QUESTION_TEMPLATE_CASES)(
    'sendTraineeTemplateMessage_新卒$templateId送信_新規チャットルームとtemplateメッセージが保存される',
    async ({ templateId, content }) => {
      const result: SendTemplateMessageResult =
        await sendTraineeTemplateMessage(
          {
            templateId,
            trainerId: TRAINER_USER_ID,
          },
          TRAINEE_USER_ID,
          'trainee',
          threadStore,
          messageStore,
        );

      expect(threadStore.create).toHaveBeenCalledWith({
        traineeId: TRAINEE_USER_ID,
        trainerId: TRAINER_USER_ID,
      });

      const expectedMessageFields = {
        threadId: CREATED_THREAD.id,
        senderId: TRAINEE_USER_ID,
        receiverId: TRAINER_USER_ID,
        content,
        type: 'template' as const,
        templateId,
      };

      expect(messageStore.append).toHaveBeenCalledWith(
        expect.objectContaining(expectedMessageFields),
      );

      expectThreadWithLatestActivity(result.thread, result.message);
      expect(result.message).toMatchObject(expectedMessageFields);
      expect(result.message.type).toBe('template');
      expect(result.message.templateId).toBe(templateId);
    },
  );

  it('sendTraineeTextMessage_新卒自由記述送信_新規チャットルームとtextメッセージが保存される', async () => {
    const result: SendTextMessageResult = await sendTraineeTextMessage(
      {
        content: R_M01_FREE_TEXT_CONTENT,
        trainerId: TRAINER_USER_ID,
      },
      TRAINEE_USER_ID,
      'trainee',
      threadStore,
      messageStore,
    );

    expect(threadStore.create).toHaveBeenCalledWith({
      traineeId: TRAINEE_USER_ID,
      trainerId: TRAINER_USER_ID,
    });

    const expectedMessageFields = {
      threadId: CREATED_THREAD.id,
      senderId: TRAINEE_USER_ID,
      receiverId: TRAINER_USER_ID,
      content: R_M01_FREE_TEXT_CONTENT,
      type: 'text' as const,
    };

    expect(messageStore.append).toHaveBeenCalledWith(
      expect.objectContaining(expectedMessageFields),
    );

    expectThreadWithLatestActivity(result.thread, result.message);
    expect(result.message).toMatchObject(expectedMessageFields);
    expect(result.message.type).toBe('text');
    expect(result.message.content).toBe(R_M01_FREE_TEXT_CONTENT);
    expect(result.message.templateId).toBeUndefined();
  });
});

/**
 * R-M08: ホームにチャットルーム一覧が表示され、送信のたびにルームが追加される
 *
 * 機能要件として、新卒コンテキストで一覧取得 API がチャットルームを返し、
 * 新規送信のたびにルーム数が増え、各ルームに先頭メッセージのプレビューが紐づくことを検証する。
 *
 * UI 要件（ホーム画面の配置・リロードなし反映）は E-M09 で検証。
 * 並び順（新しい順）は U-M14 / R-M09 / I-M05 で検証。
 *
 * 結合境界: messageFacade → messageService → MessageThreadStore / ThreadChatMessageStore
 * （インメモリストアで送受信フローを検証。HTTP 層・E2E は対象外）
 */
describe('R-M08 ホームのチャットルーム一覧と送信によるルーム追加', () => {
  const R_M08_SECOND_MESSAGE_CONTENT = 'わからないことがあるので教えてください';

  let threadStore: InMemoryMessageThreadStore;
  let messageStore: InMemoryThreadChatMessageStore;

  beforeEach(() => {
    threadStore = new InMemoryMessageThreadStore();
    messageStore = new InMemoryThreadChatMessageStore();
  });

  it('listMessageThreads_新卒初回アクセス前_チャットルーム一覧は0件', async () => {
    const result: MessageThreadListItem[] = await listMessageThreads(
      TRAINER_USER_ID,
      TRAINEE_USER_ID,
      TRAINEE_USER_ID,
      'trainee',
      threadStore,
      messageStore,
    );

    expect(result).toEqual([]);
  });

  it('listMessageThreads_新卒1回目送信後_1件のルームと先頭メッセージプレビューが返る', async () => {
    const sendResult: SendTemplateMessageResult =
      await sendTraineeTemplateMessage(
        {
          templateId: QUESTION_TEMPLATE_TQ1_ID,
          trainerId: TRAINER_USER_ID,
        },
        TRAINEE_USER_ID,
        'trainee',
        threadStore,
        messageStore,
      );

    const result: MessageThreadListItem[] = await listMessageThreads(
      TRAINER_USER_ID,
      TRAINEE_USER_ID,
      TRAINEE_USER_ID,
      'trainee',
      threadStore,
      messageStore,
    );

    expect(result).toHaveLength(1);
    expect(result[0]?.thread).toEqual(sendResult.thread);
    expect(result[0]?.firstMessage.id).toBe(sendResult.message.id);
    expect(result[0]?.firstMessage.threadId).toBe(sendResult.thread.id);
    expect(result[0]?.firstMessage.senderId).toBe(TRAINEE_USER_ID);
    expect(result[0]?.firstMessage.receiverId).toBe(TRAINER_USER_ID);
    expect(result[0]?.firstMessage.content).toBe(QUESTION_TEMPLATE_TQ1_CONTENT);
    expect(result[0]?.firstMessage.type).toBe('template');
    expect(result[0]?.firstMessage.templateId).toBe(QUESTION_TEMPLATE_TQ1_ID);
  });

  it('listMessageThreads_新卒2回目送信後_2件のルームが区別され先頭メッセージプレビューが返る', async () => {
    const firstResult: SendTemplateMessageResult =
      await sendTraineeTemplateMessage(
        {
          templateId: QUESTION_TEMPLATE_TQ1_ID,
          trainerId: TRAINER_USER_ID,
        },
        TRAINEE_USER_ID,
        'trainee',
        threadStore,
        messageStore,
      );
    const secondResult: SendTextMessageResult = await sendTraineeTextMessage(
      {
        content: R_M08_SECOND_MESSAGE_CONTENT,
        trainerId: TRAINER_USER_ID,
      },
      TRAINEE_USER_ID,
      'trainee',
      threadStore,
      messageStore,
    );

    const result: MessageThreadListItem[] = await listMessageThreads(
      TRAINER_USER_ID,
      TRAINEE_USER_ID,
      TRAINEE_USER_ID,
      'trainee',
      threadStore,
      messageStore,
    );

    expect(result).toHaveLength(2);
    expect(firstResult.thread.id).not.toBe(secondResult.thread.id);

    const firstThreadItem = findMessageThreadListItem(
      result,
      firstResult.thread.id,
    );
    const secondThreadItem = findMessageThreadListItem(
      result,
      secondResult.thread.id,
    );

    expect(firstThreadItem).toBeDefined();
    expect(secondThreadItem).toBeDefined();
    expect(firstThreadItem?.firstMessage.id).toBe(firstResult.message.id);
    expect(firstThreadItem?.firstMessage.threadId).toBe(firstResult.thread.id);
    expect(firstThreadItem?.firstMessage.type).toBe('template');
    expect(firstThreadItem?.firstMessage.content).toBe(
      QUESTION_TEMPLATE_TQ1_CONTENT,
    );
    expect(secondThreadItem?.firstMessage.id).toBe(secondResult.message.id);
    expect(secondThreadItem?.firstMessage.threadId).toBe(
      secondResult.thread.id,
    );
    expect(secondThreadItem?.firstMessage.type).toBe('text');
    expect(secondThreadItem?.firstMessage.content).toBe(
      R_M08_SECOND_MESSAGE_CONTENT,
    );
  });
});

/**
 * R-M09: チャットルーム一覧は最新のやり取り順（新しい順）に並ぶ
 *
 * 機能要件として、2 回の新規送信後に一覧取得 API が `updatedAt` 降順で返し、
 * 後から送信したルームが先頭に来ることを検証する。
 *
 * UI 要件（ホーム画面上の表示位置）は E-M10 で検証。
 * 単体ケース U-M14・Firestore 結合 I-M05 と重複するが、要件 ID 単位の網羅を目的とする。
 *
 * 結合境界: messageFacade → messageService → MessageThreadStore / ThreadChatMessageStore
 * （インメモリストアで送受信フローを検証。HTTP 層・E2E は対象外）
 */
describe('R-M09 チャットルーム一覧の新しい順ソート', () => {
  const R_M09_FIRST_SENT_AT = new Date('2026-07-22T03:00:00.000Z');
  const R_M09_SECOND_SENT_AT = new Date('2026-07-22T03:00:05.000Z');
  const R_M09_SECOND_MESSAGE_CONTENT = 'レビューをお願いしたいです';

  let threadStore: InMemoryMessageThreadStore;
  let messageStore: InMemoryThreadChatMessageStore;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(R_M09_FIRST_SENT_AT);
    threadStore = new InMemoryMessageThreadStore();
    messageStore = new InMemoryThreadChatMessageStore();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it.each([
    {
      role: 'trainee' as const,
      userId: TRAINEE_USER_ID,
      label: '新卒コンテキスト',
    },
    {
      role: 'trainer' as const,
      userId: TRAINER_USER_ID,
      label: 'トレーナーコンテキスト',
    },
  ])(
    'listMessageThreads_$labelで2回新規送信後_後から送信したルームが先頭に返る',
    async ({ role, userId }) => {
      const firstResult: SendTemplateMessageResult =
        await sendTraineeTemplateMessage(
          {
            templateId: QUESTION_TEMPLATE_TQ1_ID,
            trainerId: TRAINER_USER_ID,
          },
          TRAINEE_USER_ID,
          'trainee',
          threadStore,
          messageStore,
        );

      vi.setSystemTime(R_M09_SECOND_SENT_AT);

      const secondResult: SendTextMessageResult = await sendTraineeTextMessage(
        {
          content: R_M09_SECOND_MESSAGE_CONTENT,
          trainerId: TRAINER_USER_ID,
        },
        TRAINEE_USER_ID,
        'trainee',
        threadStore,
        messageStore,
      );

      const result: MessageThreadListItem[] = await listMessageThreads(
        TRAINER_USER_ID,
        TRAINEE_USER_ID,
        userId,
        role,
        threadStore,
        messageStore,
      );

      expect(result).toHaveLength(2);
      expect(result[0]?.thread.id).toBe(secondResult.thread.id);
      expect(result[1]?.thread.id).toBe(firstResult.thread.id);
      expect(new Date(result[0]!.thread.updatedAt).getTime()).toBeGreaterThan(
        new Date(result[1]!.thread.updatedAt).getTime(),
      );
      expect(result[0]?.thread.updatedAt).toBe(secondResult.thread.updatedAt);
      expect(result[1]?.thread.updatedAt).toBe(firstResult.thread.updatedAt);
    },
  );
});

/**
 * R-M10: チャットルームを開くと LINE 風（吹き出し・時系列・スクロール）でやり取りできる
 *
 * 機能要件として、ルーム詳細取得 API が同一 threadId のメッセージを
 * 時系列（古い→新しい）で欠落なく返し、送信者ごとに区別できることを検証する。
 *
 * UI 要件（吹き出し・スクロール・role="log"）は E-M11 で検証。
 * 単体ケース U-M07 と重複するが、要件 ID 単位の網羅を目的とする。
 *
 * 結合境界: messageFacade → messageService → MessageThreadStore / ThreadChatMessageStore
 * （インメモリストアで送受信フローを検証。HTTP 層・E2E は対象外）
 */
describe('R-M10 LINE風チャットルームでのやり取り', () => {
  const R_M10_FIRST_MESSAGE_AT = new Date('2026-07-22T03:00:00.000Z');
  const R_M10_SECOND_MESSAGE_AT = new Date('2026-07-22T03:00:01.000Z');
  const R_M10_THIRD_MESSAGE_AT = new Date('2026-07-22T03:00:02.000Z');

  let threadStore: InMemoryMessageThreadStore;
  let messageStore: InMemoryThreadChatMessageStore;
  let threadId: string;

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.setSystemTime(R_M10_FIRST_MESSAGE_AT);
    threadStore = new InMemoryMessageThreadStore();
    messageStore = new InMemoryThreadChatMessageStore();

    const initialResult: SendTemplateMessageResult =
      await sendTraineeTemplateMessage(
        {
          templateId: QUESTION_TEMPLATE_TQ1_ID,
          trainerId: TRAINER_USER_ID,
        },
        TRAINEE_USER_ID,
        'trainee',
        threadStore,
        messageStore,
      );

    threadId = initialResult.thread.id;

    vi.setSystemTime(R_M10_SECOND_MESSAGE_AT);
    await sendTrainerTemplateReply(
      {
        threadId,
        templateId: REPLY_TEMPLATE_TT2_ID,
      },
      TRAINER_USER_ID,
      'trainer',
      threadStore,
      messageStore,
    );

    vi.setSystemTime(R_M10_THIRD_MESSAGE_AT);
    await sendTrainerStampReply(
      {
        threadId,
        stampId: STAMP_ST1_ID,
      },
      TRAINER_USER_ID,
      'trainer',
      threadStore,
      messageStore,
    );
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it.each([
    {
      role: 'trainee' as const,
      userId: TRAINEE_USER_ID,
      label: '新卒コンテキスト',
    },
    {
      role: 'trainer' as const,
      userId: TRAINER_USER_ID,
      label: 'トレーナーコンテキスト',
    },
  ])(
    'listThreadChatMessages_$labelでルームを開く_同一threadIdの履歴が時系列で送信者区別付きで返る',
    async ({ role, userId }) => {
      const result: ThreadChatMessage[] = await listThreadChatMessages(
        TRAINER_USER_ID,
        TRAINEE_USER_ID,
        threadId,
        userId,
        role,
        threadStore,
        messageStore,
      );

      expect(result).toHaveLength(3);
      expect(result.every((message) => message.threadId === threadId)).toBe(
        true,
      );

      for (let index = 1; index < result.length; index += 1) {
        expect(
          new Date(result[index - 1]!.createdAt).getTime(),
        ).toBeLessThanOrEqual(new Date(result[index]!.createdAt).getTime());
      }

      expect(result[0]?.senderId).toBe(TRAINEE_USER_ID);
      expect(result[0]?.receiverId).toBe(TRAINER_USER_ID);
      expect(result[0]?.type).toBe('template');
      expect(result[0]?.content).toBe(QUESTION_TEMPLATE_TQ1_CONTENT);
      expect(result[0]?.templateId).toBe(QUESTION_TEMPLATE_TQ1_ID);

      expect(result[1]?.senderId).toBe(TRAINER_USER_ID);
      expect(result[1]?.receiverId).toBe(TRAINEE_USER_ID);
      expect(result[1]?.type).toBe('template');
      expect(result[1]?.content).toBe(REPLY_TEMPLATE_TT2_CONTENT);
      expect(result[1]?.templateId).toBe(REPLY_TEMPLATE_TT2_ID);

      expect(result[2]?.senderId).toBe(TRAINER_USER_ID);
      expect(result[2]?.receiverId).toBe(TRAINEE_USER_ID);
      expect(result[2]?.type).toBe('stamp');
      expect(result[2]?.content).toBe(STAMP_ST1_CONTENT);
    },
  );
});

/**
 * R-M11: スタンプは Slack 風（入力欄直下または近傍への横並びボタン列）に配置する
 *
 * 機能要件として、Slack 風スタンプバーで提供するトレーナー向けスタンプ ST1〜ST5 が
 * API 層で同一ルームへ送信できることを検証する。
 *
 * UI 要件（横並び配置・role="region"・レガシー「後で話そう」非表示）は E-M12 で検証。
 * 新卒敬語スタンプ（STS1〜STS5）は R-M12 / U-M15 で検証。
 * 単体ケース U-M06（ST1）と重複するが、要件 ID 単位の網羅を目的とする。
 *
 * 結合境界: messageFacade → messageService → MessageThreadStore / ThreadChatMessageStore
 * （本ケースはストアをモックした単体テスト。HTTP 層・E2E は対象外）
 */
describe('R-M11 Slack風スタンプバーからのスタンプ送信', () => {
  const R_M11_TRAINER_STAMP_CASES = [
    { stampId: STAMP_ST1_ID, content: STAMP_ST1_CONTENT },
    { stampId: 'ST2', content: '🙏 ありがとう' },
    { stampId: 'ST3', content: '✅ 了解' },
    { stampId: 'ST4', content: '⏰ あとで' },
    { stampId: 'ST5', content: '❓ 詳しく' },
  ] as const;

  let threadStore: MessageThreadStore;
  let messageStore: ThreadChatMessageStore;

  beforeEach(() => {
    threadStore = createMockMessageThreadStore({
      create: vi.fn(),
      listByParticipants: vi.fn(),
    });
    messageStore = {
      append: vi.fn().mockResolvedValue(undefined),
      listByThreadId: vi.fn().mockResolvedValue([]),
    };
  });

  it.each(R_M11_TRAINER_STAMP_CASES)(
    'sendTrainerStampReply_トレーナー$stampId送信_同一ルームにstampメッセージが保存される',
    async ({ stampId, content }) => {
      const result: SendTrainerStampReplyResult = await sendTrainerStampReply(
        {
          threadId: CREATED_THREAD.id,
          stampId,
        },
        TRAINER_USER_ID,
        'trainer',
        threadStore,
        messageStore,
      );

      expect(threadStore.getById).toHaveBeenCalledWith(CREATED_THREAD.id);
      expect(threadStore.create).not.toHaveBeenCalled();

      const expectedMessageFields = {
        threadId: CREATED_THREAD.id,
        senderId: TRAINER_USER_ID,
        receiverId: TRAINEE_USER_ID,
        content,
        type: 'stamp' as const,
      };

      expect(messageStore.append).toHaveBeenCalledWith(
        expect.objectContaining(expectedMessageFields),
      );

      expectThreadWithLatestActivity(result.thread, result.message);
      expect(result.message).toMatchObject(expectedMessageFields);
      expect(result.message.type).toBe('stamp');
      expect(result.message.content).toBe(content);
      expect(result.message.templateId).toBeUndefined();
    },
  );
});

/**
 * R-M12: 新卒も敬語スタンプ（5 種類）でクイック返信できる
 *
 * 機能要件として、Slack 風スタンプバーで提供する新卒向け敬語スタンプ STS1〜STS5 が
 * API 層で同一ルームへ送信できることを検証する。
 *
 * UI 要件（横並び配置・role="region"・敬語ラベル表示）は E-M12 / E-M13 で検証。
 * 単体ケース U-M15（STS2）と重複するが、要件 ID 単位の網羅を目的とする。
 *
 * 結合境界: messageFacade → messageService → MessageThreadStore / ThreadChatMessageStore
 * （本ケースはストアをモックした単体テスト。HTTP 層・E2E は対象外）
 */
describe('R-M12 新卒敬語スタンプでのクイック返信', () => {
  const R_M12_TRAINEE_STAMP_CASES = [
    { stampId: 'STS1', content: '🙇 ありがとうございます' },
    { stampId: 'STS2', content: '✅ 承知いたしました' },
    { stampId: 'STS3', content: '🙏 よろしくお願いいたします' },
    { stampId: 'STS4', content: '⏰ 後ほど確認いたします' },
    { stampId: 'STS5', content: '❓ 詳しく教えていただけますか' },
  ] as const;

  let threadStore: MessageThreadStore;
  let messageStore: ThreadChatMessageStore;

  beforeEach(() => {
    threadStore = createMockMessageThreadStore({
      create: vi.fn(),
      listByParticipants: vi.fn(),
    });
    messageStore = {
      append: vi.fn().mockResolvedValue(undefined),
      listByThreadId: vi.fn().mockResolvedValue([]),
    };
  });

  it.each(R_M12_TRAINEE_STAMP_CASES)(
    'sendTraineeStampReply_新卒$stampId送信_同一ルームにstampメッセージが保存される',
    async ({ stampId, content }) => {
      const result: SendTraineeStampReplyResult = await sendTraineeStampReply(
        {
          threadId: CREATED_THREAD.id,
          stampId,
        },
        TRAINEE_USER_ID,
        'trainee',
        threadStore,
        messageStore,
      );

      expect(threadStore.getById).toHaveBeenCalledWith(CREATED_THREAD.id);
      expect(threadStore.create).not.toHaveBeenCalled();

      const expectedMessageFields = {
        threadId: CREATED_THREAD.id,
        senderId: TRAINEE_USER_ID,
        receiverId: TRAINER_USER_ID,
        content,
        type: 'stamp' as const,
        stampId,
      };

      expect(messageStore.append).toHaveBeenCalledWith(
        expect.objectContaining(expectedMessageFields),
      );

      expectThreadWithLatestActivity(result.thread, result.message);
      expect(result.message).toMatchObject(expectedMessageFields);
      expect(result.message.type).toBe('stamp');
      expect(result.message.stampId).toBe(stampId);
      expect(result.message.content).toBe(content);
      expect(result.message.templateId).toBeUndefined();
    },
  );
});

/**
 * R-M13: レガシー「後で話そう」ボタンは表示・提供しない（削除済みとする）
 *
 * 機能要件として、旧フラット `ChatMessage` 返信 API（`threadId` 未指定・`traineeId` + `content` のみ）
 * で「後で話そう」を送信できないことを検証する。
 *
 * UI 要件（ボタン非表示）は E-M12 で検証。
 * 単体ケース U-M16 と重複するが、要件 ID 単位の網羅を目的とする。
 *
 * 結合境界: messageFacade → messageService（レガシー拒否）
 * （本ケースはストアをモックした単体テスト。HTTP 層の 400 応答は対象外）
 */
describe('R-M13 レガシー「後で話そう」返信の廃止', () => {
  it('sendTrainerLegacyFlatReply_トレーナー後で話そう送信_レガシー返信が拒否されフラットChatMessageに保存されない', async () => {
    await expect(
      sendTrainerLegacyFlatReply(
        {
          traineeId: TRAINEE_USER_ID,
          content: LEGACY_QUICK_REPLY_CONTENT,
        },
        TRAINER_USER_ID,
        'trainer',
      ),
    ).rejects.toBeInstanceOf(LegacyQuickReplyNotSupportedError);
  });
});

const U_M01_MESSAGE_CREATED_AT = '2026-07-22T03:00:01.000Z';

const U_M01_HEAD_MESSAGE: ThreadChatMessage = {
  id: 'message-1',
  threadId: CREATED_THREAD.id,
  senderId: TRAINEE_USER_ID,
  receiverId: TRAINER_USER_ID,
  content: QUESTION_TEMPLATE_TQ1_CONTENT,
  type: 'template',
  templateId: QUESTION_TEMPLATE_TQ1_ID,
  createdAt: U_M01_MESSAGE_CREATED_AT,
};

/**
 * U-M03: トレーナーが受信メッセージ一覧を取得
 *
 * 前提条件: 新卒が U-M01 で送信済み、トレーナーコンテキスト
 * アクション: `GET /api/status/messages?trainerId&traineeId` 相当
 * 期待結果: スレッドと先頭メッセージが含まれること。送信者・内容・時刻が正しいこと
 *
 * 結合境界: messageFacade → messageService → MessageThreadStore / ThreadChatMessageStore
 * （本ケースはストアをモックした単体テスト。HTTP 層は対象外）
 */
describe('U-M03 トレーナーが受信メッセージ一覧を取得', () => {
  let threadStore: MessageThreadStore;
  let messageStore: ThreadChatMessageStore;

  beforeEach(() => {
    threadStore = createMockMessageThreadStore({
      create: vi.fn(),
      listByParticipants: vi.fn().mockResolvedValue([CREATED_THREAD]),
      getById: vi.fn(),
    });
    messageStore = {
      append: vi.fn(),
      listByThreadId: vi.fn().mockResolvedValue([U_M01_HEAD_MESSAGE]),
    };
  });

  it('listMessageThreads_トレーナーU-M01送信済み_スレッドと先頭メッセージが返る', async () => {
    const result: MessageThreadListItem[] = await listMessageThreads(
      TRAINER_USER_ID,
      TRAINEE_USER_ID,
      TRAINER_USER_ID,
      'trainer',
      threadStore,
      messageStore,
    );

    expect(threadStore.listByParticipants).toHaveBeenCalledWith(
      TRAINEE_USER_ID,
      TRAINER_USER_ID,
    );
    expect(messageStore.listByThreadId).toHaveBeenCalledWith(CREATED_THREAD.id);

    expect(result).toHaveLength(1);
    expect(result[0]?.thread).toEqual(CREATED_THREAD);
    expect(result[0]?.firstMessage).toEqual(U_M01_HEAD_MESSAGE);
    expect(result[0]?.firstMessage.senderId).toBe(TRAINEE_USER_ID);
    expect(result[0]?.firstMessage.receiverId).toBe(TRAINER_USER_ID);
    expect(result[0]?.firstMessage.content).toBe(QUESTION_TEMPLATE_TQ1_CONTENT);
    expect(result[0]?.firstMessage.type).toBe('template');
    expect(result[0]?.firstMessage.templateId).toBe(QUESTION_TEMPLATE_TQ1_ID);
    expect(result[0]?.firstMessage.createdAt).toBe(U_M01_MESSAGE_CREATED_AT);
  });
});

/**
 * U-M04: トレーナーがスレッドにテンプレートで返信
 *
 * 前提条件: U-M01 でスレッド存在、トレーナーコンテキスト
 * アクション: `threadId` を指定しテンプレート TT2 で返信（`POST /api/status/messages` 相当）
 * 期待結果: 同一 `threadId` に `type: template` のメッセージが追加されること。新規スレッドは作成されないこと
 *
 * 結合境界: messageFacade → messageService → MessageThreadStore / ThreadChatMessageStore
 * （本ケースはストアをモックした単体テスト。HTTP 層は対象外）
 */
describe('U-M04 トレーナーがスレッドにテンプレートで返信', () => {
  let threadStore: MessageThreadStore;
  let messageStore: ThreadChatMessageStore;

  beforeEach(() => {
    threadStore = createMockMessageThreadStore({
      create: vi.fn(),
      listByParticipants: vi.fn(),
    });
    messageStore = {
      append: vi.fn().mockResolvedValue(undefined),
      listByThreadId: vi.fn().mockResolvedValue([U_M01_HEAD_MESSAGE]),
    };
  });

  it('sendTrainerTemplateReply_トレーナーTT2返信_同一スレッドにtemplateメッセージが追加される', async () => {
    const result: SendTrainerTemplateReplyResult =
      await sendTrainerTemplateReply(
        {
          threadId: CREATED_THREAD.id,
          templateId: REPLY_TEMPLATE_TT2_ID,
        },
        TRAINER_USER_ID,
        'trainer',
        threadStore,
        messageStore,
      );

    expect(threadStore.getById).toHaveBeenCalledWith(CREATED_THREAD.id);
    expect(threadStore.create).not.toHaveBeenCalled();
    expect(threadStore.listByParticipants).not.toHaveBeenCalled();

    const expectedMessageFields = {
      threadId: CREATED_THREAD.id,
      senderId: TRAINER_USER_ID,
      receiverId: TRAINEE_USER_ID,
      content: REPLY_TEMPLATE_TT2_CONTENT,
      type: 'template' as const,
      templateId: REPLY_TEMPLATE_TT2_ID,
    };

    expect(messageStore.append).toHaveBeenCalledWith(
      expect.objectContaining(expectedMessageFields),
    );

    expectThreadWithLatestActivity(result.thread, result.message);
    expect(result.message).toMatchObject(expectedMessageFields);
    expect(result.message.id).toEqual(expect.any(String));
    expect(result.message.createdAt).toEqual(expect.any(String));
    expect(result.message.threadId).toBe(CREATED_THREAD.id);
    expect(result.message.type).toBe('template');
    expect(result.message.templateId).toBe(REPLY_TEMPLATE_TT2_ID);
  });
});

/**
 * U-M05: トレーナーがスレッドに自由記述で返信
 *
 * 前提条件: U-M01 でスレッド存在、トレーナーコンテキスト
 * アクション: `threadId` を指定し自由記述「15時に声をかけてください」で返信（`POST /api/status/messages` 相当）
 * 期待結果: 同一スレッドに `type: text` が追加されること
 *
 * 結合境界: messageFacade → messageService → MessageThreadStore / ThreadChatMessageStore
 * （本ケースはストアをモックした単体テスト。HTTP 層は対象外）
 */
describe('U-M05 トレーナーがスレッドに自由記述で返信', () => {
  let threadStore: MessageThreadStore;
  let messageStore: ThreadChatMessageStore;

  beforeEach(() => {
    threadStore = createMockMessageThreadStore({
      create: vi.fn(),
      listByParticipants: vi.fn(),
    });
    messageStore = {
      append: vi.fn().mockResolvedValue(undefined),
      listByThreadId: vi.fn().mockResolvedValue([U_M01_HEAD_MESSAGE]),
    };
  });

  it('sendTrainerTextReply_トレーナー自由記述返信_同一スレッドにtextメッセージが追加される', async () => {
    const result: SendTrainerTextReplyResult = await sendTrainerTextReply(
      {
        threadId: CREATED_THREAD.id,
        content: U_M05_FREE_TEXT_CONTENT,
      },
      TRAINER_USER_ID,
      'trainer',
      threadStore,
      messageStore,
    );

    expect(threadStore.getById).toHaveBeenCalledWith(CREATED_THREAD.id);
    expect(threadStore.create).not.toHaveBeenCalled();
    expect(threadStore.listByParticipants).not.toHaveBeenCalled();

    const expectedMessageFields = {
      threadId: CREATED_THREAD.id,
      senderId: TRAINER_USER_ID,
      receiverId: TRAINEE_USER_ID,
      content: U_M05_FREE_TEXT_CONTENT,
      type: 'text' as const,
    };

    expect(messageStore.append).toHaveBeenCalledWith(
      expect.objectContaining(expectedMessageFields),
    );

    expectThreadWithLatestActivity(result.thread, result.message);
    expect(result.message).toMatchObject(expectedMessageFields);
    expect(result.message.id).toEqual(expect.any(String));
    expect(result.message.createdAt).toEqual(expect.any(String));
    expect(result.message.threadId).toBe(CREATED_THREAD.id);
    expect(result.message.type).toBe('text');
    expect(result.message.content).toBe(U_M05_FREE_TEXT_CONTENT);
    expect(result.message.templateId).toBeUndefined();
  });
});

/**
 * U-M06: トレーナーがスタンプで返信
 *
 * 前提条件: U-M01 でスレッド存在、トレーナーコンテキスト
 * アクション: `threadId` を指定しスタンプ ST1（👍 OK）を送信（`POST /api/status/messages` 相当）
 * 期待結果: 同一スレッドに `type: stamp`・`content` がスタンプ内容で追加されること
 *
 * 結合境界: messageFacade → messageService → MessageThreadStore / ThreadChatMessageStore
 * （本ケースはストアをモックした単体テスト。HTTP 層は対象外）
 */
describe('U-M06 トレーナーがスタンプで返信', () => {
  let threadStore: MessageThreadStore;
  let messageStore: ThreadChatMessageStore;

  beforeEach(() => {
    threadStore = createMockMessageThreadStore({
      create: vi.fn(),
      listByParticipants: vi.fn(),
    });
    messageStore = {
      append: vi.fn().mockResolvedValue(undefined),
      listByThreadId: vi.fn().mockResolvedValue([U_M01_HEAD_MESSAGE]),
    };
  });

  it('sendTrainerStampReply_トレーナーST1送信_同一スレッドにstampメッセージが追加される', async () => {
    const result: SendTrainerStampReplyResult = await sendTrainerStampReply(
      {
        threadId: CREATED_THREAD.id,
        stampId: STAMP_ST1_ID,
      },
      TRAINER_USER_ID,
      'trainer',
      threadStore,
      messageStore,
    );

    expect(threadStore.getById).toHaveBeenCalledWith(CREATED_THREAD.id);
    expect(threadStore.create).not.toHaveBeenCalled();
    expect(threadStore.listByParticipants).not.toHaveBeenCalled();

    const expectedMessageFields = {
      threadId: CREATED_THREAD.id,
      senderId: TRAINER_USER_ID,
      receiverId: TRAINEE_USER_ID,
      content: STAMP_ST1_CONTENT,
      type: 'stamp' as const,
    };

    expect(messageStore.append).toHaveBeenCalledWith(
      expect.objectContaining(expectedMessageFields),
    );

    expectThreadWithLatestActivity(result.thread, result.message);
    expect(result.message).toMatchObject(expectedMessageFields);
    expect(result.message.id).toEqual(expect.any(String));
    expect(result.message.createdAt).toEqual(expect.any(String));
    expect(result.message.threadId).toBe(CREATED_THREAD.id);
    expect(result.message.type).toBe('stamp');
    expect(result.message.content).toBe(STAMP_ST1_CONTENT);
    expect(result.message.templateId).toBeUndefined();
  });
});

const U_M04_REPLY_MESSAGE_CREATED_AT = '2026-07-22T03:00:02.000Z';

const U_M04_TRAINER_TEMPLATE_REPLY: ThreadChatMessage = {
  id: 'message-2',
  threadId: CREATED_THREAD.id,
  senderId: TRAINER_USER_ID,
  receiverId: TRAINEE_USER_ID,
  content: REPLY_TEMPLATE_TT2_CONTENT,
  type: 'template',
  templateId: REPLY_TEMPLATE_TT2_ID,
  createdAt: U_M04_REPLY_MESSAGE_CREATED_AT,
};

const U_M07_THREAD_HISTORY: ThreadChatMessage[] = [
  U_M01_HEAD_MESSAGE,
  U_M04_TRAINER_TEMPLATE_REPLY,
];

/**
 * U-M07: 新卒がスレッド履歴を取得
 *
 * 前提条件: U-M04 で返信済み、新卒コンテキスト
 * アクション: `GET /api/status/messages`（またはスレッド詳細 API）相当
 * 期待結果: 質問と返信が時系列で取得できること
 *
 * 結合境界: messageFacade → messageService → MessageThreadStore / ThreadChatMessageStore
 * （本ケースはストアをモックした単体テスト。HTTP 層は対象外）
 */
describe('U-M07 新卒がスレッド履歴を取得', () => {
  let threadStore: MessageThreadStore;
  let messageStore: ThreadChatMessageStore;

  beforeEach(() => {
    threadStore = createMockMessageThreadStore({
      create: vi.fn(),
      listByParticipants: vi.fn(),
    });
    messageStore = {
      append: vi.fn(),
      listByThreadId: vi.fn().mockResolvedValue(U_M07_THREAD_HISTORY),
    };
  });

  it('listThreadChatMessages_新卒U-M04返信済み_質問と返信が時系列で返る', async () => {
    const result: ThreadChatMessage[] = await listThreadChatMessages(
      TRAINER_USER_ID,
      TRAINEE_USER_ID,
      CREATED_THREAD.id,
      TRAINEE_USER_ID,
      'trainee',
      threadStore,
      messageStore,
    );

    expect(threadStore.getById).toHaveBeenCalledWith(CREATED_THREAD.id);
    expect(messageStore.listByThreadId).toHaveBeenCalledWith(CREATED_THREAD.id);
    expect(threadStore.create).not.toHaveBeenCalled();

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(U_M01_HEAD_MESSAGE);
    expect(result[1]).toEqual(U_M04_TRAINER_TEMPLATE_REPLY);
    expect(result[0]?.senderId).toBe(TRAINEE_USER_ID);
    expect(result[0]?.type).toBe('template');
    expect(result[0]?.content).toBe(QUESTION_TEMPLATE_TQ1_CONTENT);
    expect(result[1]?.senderId).toBe(TRAINER_USER_ID);
    expect(result[1]?.type).toBe('template');
    expect(result[1]?.content).toBe(REPLY_TEMPLATE_TT2_CONTENT);
    expect(result[0]?.createdAt).toBe(U_M01_MESSAGE_CREATED_AT);
    expect(result[1]?.createdAt).toBe(U_M04_REPLY_MESSAGE_CREATED_AT);
    expect(new Date(result[0]!.createdAt).getTime()).toBeLessThanOrEqual(
      new Date(result[1]!.createdAt).getTime(),
    );
  });
});

/**
 * U-M08: トレーナーが新規メッセージでスレッド開始
 *
 * 前提条件: トレーナーコンテキスト、未読スレッドなし
 * アクション: テンプレート TT4 を送信（`threadId` 未指定、`POST /api/status/messages` 相当）
 * 期待結果: 新規スレッドが作成され、新卒側一覧に表示可能なこと
 *
 * 結合境界: messageFacade → messageService → MessageThreadStore / ThreadChatMessageStore
 * （本ケースはストアをモックした単体テスト。HTTP 層は対象外）
 */
describe('U-M08 トレーナーが新規メッセージでスレッド開始', () => {
  let threadStore: MessageThreadStore;
  let messageStore: ThreadChatMessageStore;

  beforeEach(() => {
    threadStore = createMockMessageThreadStore({ getById: vi.fn() });
    messageStore = {
      append: vi.fn().mockResolvedValue(undefined),
      listByThreadId: vi.fn().mockResolvedValue([]),
    };
  });

  it('sendTrainerTemplateMessage_トレーナーTT4送信_新規スレッドとtemplateメッセージが保存される', async () => {
    const result: SendTrainerTemplateMessageResult =
      await sendTrainerTemplateMessage(
        {
          templateId: REPLY_TEMPLATE_TT4_ID,
          traineeId: TRAINEE_USER_ID,
        },
        TRAINER_USER_ID,
        'trainer',
        threadStore,
        messageStore,
      );

    expect(threadStore.create).toHaveBeenCalledWith({
      traineeId: TRAINEE_USER_ID,
      trainerId: TRAINER_USER_ID,
    });
    expect(threadStore.getById).not.toHaveBeenCalled();

    const expectedMessageFields = {
      threadId: CREATED_THREAD.id,
      senderId: TRAINER_USER_ID,
      receiverId: TRAINEE_USER_ID,
      content: REPLY_TEMPLATE_TT4_CONTENT,
      type: 'template' as const,
      templateId: REPLY_TEMPLATE_TT4_ID,
    };

    expect(messageStore.append).toHaveBeenCalledWith(
      expect.objectContaining(expectedMessageFields),
    );

    expectThreadWithLatestActivity(result.thread, result.message);
    expect(result.thread.traineeId).toBe(TRAINEE_USER_ID);
    expect(result.thread.trainerId).toBe(TRAINER_USER_ID);
    expect(result.message).toMatchObject(expectedMessageFields);
    expect(result.message.id).toEqual(expect.any(String));
    expect(result.message.createdAt).toEqual(expect.any(String));
    expect(result.message.threadId).toBe(CREATED_THREAD.id);
    expect(result.message.type).toBe('template');
    expect(result.message.templateId).toBe(REPLY_TEMPLATE_TT4_ID);
  });
});

/**
 * U-M09: 空の自由記述は送信拒否
 *
 * 前提条件: 新卒コンテキスト
 * アクション: `content` が空文字または空白のみで POST（`POST /api/status/messages` 相当）
 * 期待結果: `400` が返却され、メッセージ・スレッドが作成されないこと
 *
 * 結合境界: messageFacade → messageService（バリデーション）→ MessageThreadStore / ThreadChatMessageStore
 * （本ケースはストアをモックした単体テスト。HTTP 層は対象外。400 相当は MessageContentRequiredError）
 */
describe('U-M09 空の自由記述は送信拒否', () => {
  let threadStore: MessageThreadStore;
  let messageStore: ThreadChatMessageStore;

  beforeEach(() => {
    threadStore = createMockMessageThreadStore({
      create: vi.fn(),
      listByParticipants: vi.fn(),
      getById: vi.fn(),
    });
    messageStore = {
      append: vi.fn(),
      listByThreadId: vi.fn(),
    };
  });

  it('sendTraineeTextMessage_新卒空文字_送信拒否されスレッドもメッセージも作成されない', async () => {
    await expect(
      sendTraineeTextMessage(
        { content: '', trainerId: TRAINER_USER_ID },
        TRAINEE_USER_ID,
        'trainee',
        threadStore,
        messageStore,
      ),
    ).rejects.toBeInstanceOf(MessageContentRequiredError);

    expect(threadStore.listByParticipants).not.toHaveBeenCalled();
    expect(threadStore.create).not.toHaveBeenCalled();
    expect(messageStore.append).not.toHaveBeenCalled();
  });

  it('sendTraineeTextMessage_新卒空白のみ_送信拒否されスレッドもメッセージも作成されない', async () => {
    await expect(
      sendTraineeTextMessage(
        { content: '   ', trainerId: TRAINER_USER_ID },
        TRAINEE_USER_ID,
        'trainee',
        threadStore,
        messageStore,
      ),
    ).rejects.toBeInstanceOf(MessageContentRequiredError);

    expect(threadStore.listByParticipants).not.toHaveBeenCalled();
    expect(threadStore.create).not.toHaveBeenCalled();
    expect(messageStore.append).not.toHaveBeenCalled();
  });
});

/**
 * U-M10: 未選択テンプレートは送信拒否
 *
 * 前提条件: 新卒コンテキスト
 * アクション: テンプレート未選択のまま送信 API を呼ぶ（`POST /api/status/messages` 相当）
 * 期待結果: サーバーで送信が阻止され、メッセージ・スレッドが作成されないこと
 * （UI での送信ボタン無効は E2E の責務。本ケースは 400 相当の MessageTemplateRequiredError）
 *
 * 結合境界: messageFacade → messageService（バリデーション）→ MessageThreadStore / ThreadChatMessageStore
 * （本ケースはストアをモックした単体テスト。HTTP 層は対象外）
 */
describe('U-M10 未選択テンプレートは送信拒否', () => {
  let threadStore: MessageThreadStore;
  let messageStore: ThreadChatMessageStore;

  beforeEach(() => {
    threadStore = createMockMessageThreadStore({
      create: vi.fn(),
      listByParticipants: vi.fn(),
      getById: vi.fn(),
    });
    messageStore = {
      append: vi.fn(),
      listByThreadId: vi.fn(),
    };
  });

  it('sendTraineeTemplateMessage_新卒テンプレート未選択空文字_送信拒否されスレッドもメッセージも作成されない', async () => {
    await expect(
      sendTraineeTemplateMessage(
        { templateId: '', trainerId: TRAINER_USER_ID },
        TRAINEE_USER_ID,
        'trainee',
        threadStore,
        messageStore,
      ),
    ).rejects.toBeInstanceOf(MessageTemplateRequiredError);

    expect(threadStore.listByParticipants).not.toHaveBeenCalled();
    expect(threadStore.create).not.toHaveBeenCalled();
    expect(messageStore.append).not.toHaveBeenCalled();
  });

  it('sendTraineeTemplateMessage_新卒テンプレート未選択空白のみ_送信拒否されスレッドもメッセージも作成されない', async () => {
    await expect(
      sendTraineeTemplateMessage(
        { templateId: '   ', trainerId: TRAINER_USER_ID },
        TRAINEE_USER_ID,
        'trainee',
        threadStore,
        messageStore,
      ),
    ).rejects.toBeInstanceOf(MessageTemplateRequiredError);

    expect(threadStore.listByParticipants).not.toHaveBeenCalled();
    expect(threadStore.create).not.toHaveBeenCalled();
    expect(messageStore.append).not.toHaveBeenCalled();
  });
});

/**
 * U-M11: 参加者以外はメッセージ取得不可
 *
 * 前提条件: 第三者ユーザー ID のコンテキスト（会話の trainer / trainee 以外）
 * アクション: `GET /api/status/messages?trainerId&traineeId` 相当（`listMessageThreads`）
 * 期待結果: `403` が返却されること
 *
 * 結合境界: messageFacade → messageService（認可）→ MessageThreadStore / ThreadChatMessageStore
 * （本ケースはストアをモックした単体テスト。HTTP 層は対象外。403 相当は ForbiddenError）
 */
describe('U-M11 参加者以外はメッセージ取得不可', () => {
  let threadStore: MessageThreadStore;
  let messageStore: ThreadChatMessageStore;

  beforeEach(() => {
    threadStore = createMockMessageThreadStore({
      create: vi.fn(),
      listByParticipants: vi.fn().mockResolvedValue([CREATED_THREAD]),
      getById: vi.fn(),
    });
    messageStore = {
      append: vi.fn(),
      listByThreadId: vi.fn().mockResolvedValue([U_M01_HEAD_MESSAGE]),
    };
  });

  it('listMessageThreads_第三者ユーザー_403相当で拒否されストアが呼ばれない', async () => {
    await expect(
      listMessageThreads(
        TRAINER_USER_ID,
        TRAINEE_USER_ID,
        THIRD_PARTY_USER_ID,
        'trainee',
        threadStore,
        messageStore,
      ),
    ).rejects.toBeInstanceOf(ForbiddenError);

    expect(threadStore.listByParticipants).not.toHaveBeenCalled();
    expect(messageStore.listByThreadId).not.toHaveBeenCalled();
  });
});

/**
 * U-M12: 存在しないスレッドへの返信拒否
 *
 * 前提条件: トレーナーコンテキスト
 * アクション: 不正な `threadId` で返信 POST（`POST /api/status/messages` 相当）
 * 期待結果: `404` が返却され、メッセージが作成されないこと
 *
 * 結合境界: messageFacade → messageService → messageThreadLoader → MessageThreadStore
 * （本ケースはストアをモックした単体テスト。HTTP 層は対象外。404 相当は MessageThreadNotFoundError）
 */
describe('U-M12 存在しないスレッドへの返信拒否', () => {
  let threadStore: MessageThreadStore;
  let messageStore: ThreadChatMessageStore;

  beforeEach(() => {
    threadStore = createMockMessageThreadStore({
      create: vi.fn(),
      listByParticipants: vi.fn(),
      getById: vi.fn().mockResolvedValue(null),
    });
    messageStore = {
      append: vi.fn(),
      listByThreadId: vi.fn(),
    };
  });

  it('sendTrainerTemplateReply_不正threadId_404相当で拒否されメッセージが作成されない', async () => {
    await expect(
      sendTrainerTemplateReply(
        {
          threadId: INVALID_THREAD_ID,
          templateId: REPLY_TEMPLATE_TT2_ID,
        },
        TRAINER_USER_ID,
        'trainer',
        threadStore,
        messageStore,
      ),
    ).rejects.toBeInstanceOf(MessageThreadNotFoundError);

    expect(threadStore.getById).toHaveBeenCalledWith(INVALID_THREAD_ID);
    expect(threadStore.create).not.toHaveBeenCalled();
    expect(threadStore.listByParticipants).not.toHaveBeenCalled();
    expect(messageStore.append).not.toHaveBeenCalled();
  });
});

/**
 * U-M13: 新卒がトレーナー宛以外に送信不可
 *
 * 前提条件: 新卒コンテキスト（担当トレーナーは `trainer-1`）
 * アクション: 担当外 `trainerId` へ POST（`POST /api/status/messages` 相当）
 * 期待結果: `403` が返却され、メッセージ・スレッドが作成されないこと
 *
 * 結合境界: messageFacade → messageService（担当トレーナー検証）→ MessageThreadStore / ThreadChatMessageStore
 * （本ケースはストアをモックした単体テスト。HTTP 層は対象外。403 相当は ForbiddenError）
 */
describe('U-M13 新卒がトレーナー宛以外に送信不可', () => {
  let threadStore: MessageThreadStore;
  let messageStore: ThreadChatMessageStore;

  beforeEach(() => {
    threadStore = createMockMessageThreadStore({
      create: vi.fn(),
      listByParticipants: vi.fn(),
      getById: vi.fn(),
    });
    messageStore = {
      append: vi.fn(),
      listByThreadId: vi.fn(),
    };
  });

  it('sendTraineeTemplateMessage_新卒担当外trainerId_403相当で拒否されスレッドもメッセージも作成されない', async () => {
    await expect(
      sendTraineeTemplateMessage(
        {
          templateId: QUESTION_TEMPLATE_TQ1_ID,
          trainerId: UNASSIGNED_TRAINER_USER_ID,
        },
        TRAINEE_USER_ID,
        'trainee',
        threadStore,
        messageStore,
      ),
    ).rejects.toBeInstanceOf(ForbiddenError);

    expect(threadStore.listByParticipants).not.toHaveBeenCalled();
    expect(threadStore.create).not.toHaveBeenCalled();
    expect(messageStore.append).not.toHaveBeenCalled();
  });
});

/**
 * U-M14: チャットルーム一覧が新しい順
 *
 * 前提条件: 新卒が異なる内容で 2 回新規送信済み
 * アクション: `GET /api/status/messages?trainerId&traineeId&view=threads` 相当（新卒またはトレーナーコンテキスト）
 * 期待結果: 2 ルームが返り、後から送信したルームが先頭（`updatedAt` 降順）であること
 *
 * 結合境界: messageFacade → messageService → MessageThreadStore / ThreadChatMessageStore
 * （インメモリストアで送受信フローを検証。HTTP 層・E2E は対象外）
 *
 * 要件 ID 単位の網羅のため R-M09 / I-M05 と重複する。
 */
describe('U-M14 チャットルーム一覧が新しい順', () => {
  const U_M14_FIRST_SENT_AT = new Date('2026-07-22T04:00:00.000Z');
  const U_M14_SECOND_SENT_AT = new Date('2026-07-22T04:00:05.000Z');
  const U_M14_SECOND_MESSAGE_CONTENT = 'わからないことがあるので教えてください';

  let threadStore: InMemoryMessageThreadStore;
  let messageStore: InMemoryThreadChatMessageStore;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(U_M14_FIRST_SENT_AT);
    threadStore = new InMemoryMessageThreadStore();
    messageStore = new InMemoryThreadChatMessageStore();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it.each([
    {
      role: 'trainee' as const,
      userId: TRAINEE_USER_ID,
      label: '新卒コンテキスト',
    },
    {
      role: 'trainer' as const,
      userId: TRAINER_USER_ID,
      label: 'トレーナーコンテキスト',
    },
  ])(
    'listMessageThreads_$labelで2回新規送信後_updatedAt降順で後から送信したルームが先頭',
    async ({ role, userId }) => {
      const firstResult: SendTemplateMessageResult =
        await sendTraineeTemplateMessage(
          {
            templateId: QUESTION_TEMPLATE_TQ1_ID,
            trainerId: TRAINER_USER_ID,
          },
          TRAINEE_USER_ID,
          'trainee',
          threadStore,
          messageStore,
        );

      vi.setSystemTime(U_M14_SECOND_SENT_AT);

      const secondResult: SendTextMessageResult = await sendTraineeTextMessage(
        {
          content: U_M14_SECOND_MESSAGE_CONTENT,
          trainerId: TRAINER_USER_ID,
        },
        TRAINEE_USER_ID,
        'trainee',
        threadStore,
        messageStore,
      );

      const result: MessageThreadListItem[] = await listMessageThreads(
        TRAINER_USER_ID,
        TRAINEE_USER_ID,
        userId,
        role,
        threadStore,
        messageStore,
      );

      expect(result).toHaveLength(2);
      expect(result[0]?.thread.id).toBe(secondResult.thread.id);
      expect(result[1]?.thread.id).toBe(firstResult.thread.id);
      expect(new Date(result[0]!.thread.updatedAt).getTime()).toBeGreaterThan(
        new Date(result[1]!.thread.updatedAt).getTime(),
      );
      expect(result[0]?.thread.updatedAt).toBe(secondResult.thread.updatedAt);
      expect(result[1]?.thread.updatedAt).toBe(firstResult.thread.updatedAt);
    },
  );
});

/**
 * U-M15: 新卒が敬語スタンプで返信
 *
 * 前提条件: U-M04 でトレーナー返信済み、新卒コンテキスト
 * アクション: `threadId` を指定し STS2（✅ 承知いたしました）を送信（`POST /api/status/messages` 相当）
 * 期待結果: 同一ルームに `type: stamp`・`stampId: STS2` が追加されること
 *
 * 結合境界: messageFacade → messageService → MessageThreadStore / ThreadChatMessageStore
 * （本ケースはストアをモックした単体テスト。HTTP 層・E2E は対象外）
 *
 * 要件 ID 単位の網羅のため R-M12（STS1〜STS5）と重複する。
 */
describe('U-M15 新卒が敬語スタンプで返信', () => {
  const U_M04_TRAINER_REPLY_MESSAGE: ThreadChatMessage = {
    id: 'message-2',
    threadId: CREATED_THREAD.id,
    senderId: TRAINER_USER_ID,
    receiverId: TRAINEE_USER_ID,
    content: REPLY_TEMPLATE_TT2_CONTENT,
    type: 'template',
    templateId: REPLY_TEMPLATE_TT2_ID,
    createdAt: '2026-07-22T03:00:02.000Z',
  };

  let threadStore: MessageThreadStore;
  let messageStore: ThreadChatMessageStore;

  beforeEach(() => {
    threadStore = createMockMessageThreadStore({
      create: vi.fn(),
      listByParticipants: vi.fn(),
    });
    messageStore = {
      append: vi.fn().mockResolvedValue(undefined),
      listByThreadId: vi
        .fn()
        .mockResolvedValue([U_M01_HEAD_MESSAGE, U_M04_TRAINER_REPLY_MESSAGE]),
    };
  });

  it('sendTraineeStampReply_新卒STS2送信_同一スレッドにstampメッセージが追加される', async () => {
    const result: SendTraineeStampReplyResult = await sendTraineeStampReply(
      {
        threadId: CREATED_THREAD.id,
        stampId: TRAINEE_STAMP_STS2_ID,
      },
      TRAINEE_USER_ID,
      'trainee',
      threadStore,
      messageStore,
    );

    expect(threadStore.getById).toHaveBeenCalledWith(CREATED_THREAD.id);
    expect(threadStore.create).not.toHaveBeenCalled();
    expect(threadStore.listByParticipants).not.toHaveBeenCalled();

    const expectedMessageFields = {
      threadId: CREATED_THREAD.id,
      senderId: TRAINEE_USER_ID,
      receiverId: TRAINER_USER_ID,
      content: TRAINEE_STAMP_STS2_CONTENT,
      type: 'stamp' as const,
      stampId: TRAINEE_STAMP_STS2_ID,
    };

    expect(messageStore.append).toHaveBeenCalledWith(
      expect.objectContaining(expectedMessageFields),
    );

    expectThreadWithLatestActivity(result.thread, result.message);
    expect(result.message).toMatchObject(expectedMessageFields);
    expect(result.message.id).toEqual(expect.any(String));
    expect(result.message.createdAt).toEqual(expect.any(String));
    expect(result.message.threadId).toBe(CREATED_THREAD.id);
    expect(result.message.type).toBe('stamp');
    expect(result.message.stampId).toBe(TRAINEE_STAMP_STS2_ID);
    expect(result.message.content).toBe(TRAINEE_STAMP_STS2_CONTENT);
    expect(result.message.templateId).toBeUndefined();
  });
});

/**
 * U-M16: レガシー「後で話そう」返信の廃止
 *
 * 前提条件: トレーナーコンテキスト
 * アクション: `traineeId` + `content: "後で話そう"` のみのレガシー POST（`threadId` なし）
 * 期待結果: `400` 相当（`LegacyQuickReplyNotSupportedError`）。フラット `ChatMessage` への単独返信が成功しないこと
 *
 * 結合境界: messageFacade → messageService（レガシー拒否）
 * （本ケースはストアをモックした単体テスト。HTTP 層の 400 応答は対象外）
 *
 * 要件 ID 単位の網羅のため R-M13 と重複する。
 */
describe('U-M16 レガシー「後で話そう」返信の廃止', () => {
  it('sendTrainerLegacyFlatReply_トレーナー後で話そうレガシーPOST_フラットChatMessageへの単独返信が拒否される', async () => {
    await expect(
      sendTrainerLegacyFlatReply(
        {
          traineeId: TRAINEE_USER_ID,
          content: LEGACY_QUICK_REPLY_CONTENT,
        },
        TRAINER_USER_ID,
        'trainer',
      ),
    ).rejects.toBeInstanceOf(LegacyQuickReplyNotSupportedError);
  });
});

/**
 * U-M17: ルーム一覧に最終更新日時を返す
 *
 * 前提条件: 新卒がメッセージ送信済み（返信ケースではトレーナー返信済み）
 * アクション: `GET /api/status/messages?trainerId&traineeId&view=threads` 相当（`listMessageThreads`）
 * 期待結果: 各 `MessageThreadListItem.thread.updatedAt` が当該ルームの **直近メッセージ** の `createdAt` と一致すること
 *
 * 結合境界: messageFacade → messageService → MessageThreadStore / ThreadChatMessageStore
 * （インメモリストアで送受信フローを検証。HTTP 層・E2E は対象外）
 *
 * 要件 ID 単位の網羅のため U-M14（並び順）と重複するが、日時の意味（最終やり取り）を検証する。
 */
describe('U-M17 ルーム一覧に最終更新日時を返す', () => {
  const U_M17_INITIAL_SENT_AT = new Date('2026-07-23T05:00:00.000Z');
  const U_M17_REPLY_SENT_AT = new Date('2026-07-23T05:00:10.000Z');

  let threadStore: InMemoryMessageThreadStore;
  let messageStore: InMemoryThreadChatMessageStore;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(U_M17_INITIAL_SENT_AT);
    threadStore = new InMemoryMessageThreadStore();
    messageStore = new InMemoryThreadChatMessageStore();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function latestThreadChatMessage(
    messages: ThreadChatMessage[],
  ): ThreadChatMessage {
    return [...messages].sort(
      (left, right) =>
        new Date(right.createdAt).getTime() -
        new Date(left.createdAt).getTime(),
    )[0]!;
  }

  it('listMessageThreads_新卒初回送信後_updatedAtが直近メッセージ時刻と一致する', async () => {
    const sendResult: SendTemplateMessageResult =
      await sendTraineeTemplateMessage(
        {
          templateId: QUESTION_TEMPLATE_TQ1_ID,
          trainerId: TRAINER_USER_ID,
        },
        TRAINEE_USER_ID,
        'trainee',
        threadStore,
        messageStore,
      );

    const threadList: MessageThreadListItem[] = await listMessageThreads(
      TRAINER_USER_ID,
      TRAINEE_USER_ID,
      TRAINEE_USER_ID,
      'trainee',
      threadStore,
      messageStore,
    );

    const history: ThreadChatMessage[] = await listThreadChatMessages(
      TRAINER_USER_ID,
      TRAINEE_USER_ID,
      sendResult.thread.id,
      TRAINEE_USER_ID,
      'trainee',
      threadStore,
      messageStore,
    );
    const latestMessage = latestThreadChatMessage(history);

    expect(threadList).toHaveLength(1);
    expect(threadList[0]?.thread.updatedAt).toBe(latestMessage.createdAt);
    expect(threadList[0]?.thread.updatedAt).toBe(sendResult.message.createdAt);
    expect(threadList[0]?.thread.updatedAt).toBe(sendResult.thread.updatedAt);
  });

  it.each([
    {
      role: 'trainee' as const,
      userId: TRAINEE_USER_ID,
      label: '新卒コンテキスト',
    },
    {
      role: 'trainer' as const,
      userId: TRAINER_USER_ID,
      label: 'トレーナーコンテキスト',
    },
  ])(
    'listMessageThreads_$labelでトレーナー返信後_updatedAtが直近メッセージ時刻と一致する',
    async ({ role, userId }) => {
      const initialResult: SendTemplateMessageResult =
        await sendTraineeTemplateMessage(
          {
            templateId: QUESTION_TEMPLATE_TQ1_ID,
            trainerId: TRAINER_USER_ID,
          },
          TRAINEE_USER_ID,
          'trainee',
          threadStore,
          messageStore,
        );

      vi.setSystemTime(U_M17_REPLY_SENT_AT);

      const replyResult: SendTrainerTemplateReplyResult =
        await sendTrainerTemplateReply(
          {
            threadId: initialResult.thread.id,
            templateId: REPLY_TEMPLATE_TT2_ID,
          },
          TRAINER_USER_ID,
          'trainer',
          threadStore,
          messageStore,
        );

      const threadList: MessageThreadListItem[] = await listMessageThreads(
        TRAINER_USER_ID,
        TRAINEE_USER_ID,
        userId,
        role,
        threadStore,
        messageStore,
      );

      const history: ThreadChatMessage[] = await listThreadChatMessages(
        TRAINER_USER_ID,
        TRAINEE_USER_ID,
        initialResult.thread.id,
        userId,
        role,
        threadStore,
        messageStore,
      );
      const latestMessage = latestThreadChatMessage(history);

      expect(threadList).toHaveLength(1);
      expect(threadList[0]?.thread.updatedAt).toBe(latestMessage.createdAt);
      expect(threadList[0]?.thread.updatedAt).toBe(
        replyResult.message.createdAt,
      );
      expect(threadList[0]?.thread.updatedAt).not.toBe(
        initialResult.message.createdAt,
      );
      expect(
        new Date(threadList[0]!.thread.updatedAt).getTime(),
      ).toBeGreaterThan(new Date(initialResult.message.createdAt).getTime());
    },
  );
});

/**
 * R-M16: ルーム開封時にチャット欄下端へ視点固定（API 契約）
 *
 * UI のスクロール位置は E-M16 で検証する。API 層ではルーム詳細取得時に返す履歴が
 * **昇順（古い→新しい）** であり、**末尾が最新メッセージ（viewport アンカー）** であることを保証する。
 *
 * 結合境界: messageThreadViewport（純関数） / messageFacade → messageService → messageThreadDetailQuery
 * （インメモリストアで送受信フローを検証。HTTP 層・E2E は対象外）
 *
 * 要件 ID 単位の網羅のため U-M07 / R-M10（時系列）と重複するが、下端固定の API 契約を検証する。
 */
describe('R-M16 ルーム開封時に履歴末尾が最新メッセージである', () => {
  it('selectThreadViewportAnchorMessage_逆順配列_最新createdAtのメッセージを返す', () => {
    const anchor = selectThreadViewportAnchorMessage([
      U_M04_TRAINER_TEMPLATE_REPLY,
      U_M01_HEAD_MESSAGE,
    ]);

    expect(anchor).toEqual(U_M04_TRAINER_TEMPLATE_REPLY);
    expect(anchor?.createdAt).toBe(U_M04_REPLY_MESSAGE_CREATED_AT);
  });

  it('isThreadHistoryViewportAnchored_末尾が最新でない配列_falseを返す', () => {
    expect(
      isThreadHistoryViewportAnchored([
        U_M04_TRAINER_TEMPLATE_REPLY,
        U_M01_HEAD_MESSAGE,
      ]),
    ).toBe(false);
  });

  it('isThreadHistoryViewportAnchored_末尾が最新の昇順配列_trueを返す', () => {
    expect(
      isThreadHistoryViewportAnchored([
        U_M01_HEAD_MESSAGE,
        U_M04_TRAINER_TEMPLATE_REPLY,
      ]),
    ).toBe(true);
  });
});

/**
 * U-M18: ルーム開封時に履歴末尾が最新メッセージである
 *
 * 前提条件: 新卒が質問送信済み（返信ケースではトレーナー TT2 返信済み）
 * アクション: `GET /api/status/messages?view=thread&threadId=...` 相当（`listThreadChatMessages`）
 * 期待結果: 返却配列の **末尾** が当該ルームの最新メッセージであり、`thread.updatedAt` と一致すること
 *
 * 結合境界: messageFacade → messageService → messageThreadDetailQuery → messageThreadViewport
 * （インメモリストアで送受信フローを検証。HTTP 層・E2E は対象外）
 */
describe('U-M18 ルーム開封時に履歴末尾が最新メッセージである', () => {
  const U_M18_INITIAL_SENT_AT = new Date('2026-07-23T05:10:00.000Z');
  const U_M18_REPLY_SENT_AT = new Date('2026-07-23T05:10:10.000Z');

  let threadStore: InMemoryMessageThreadStore;
  let messageStore: InMemoryThreadChatMessageStore;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(U_M18_INITIAL_SENT_AT);
    threadStore = new InMemoryMessageThreadStore();
    messageStore = new InMemoryThreadChatMessageStore();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function latestThreadChatMessage(
    messages: ThreadChatMessage[],
  ): ThreadChatMessage {
    return [...messages].sort(
      (left, right) =>
        new Date(right.createdAt).getTime() -
        new Date(left.createdAt).getTime(),
    )[0]!;
  }

  it('listThreadChatMessages_新卒初回送信後_履歴末尾が最新メッセージかつupdatedAtと一致する', async () => {
    const sendResult: SendTemplateMessageResult =
      await sendTraineeTemplateMessage(
        {
          templateId: QUESTION_TEMPLATE_TQ1_ID,
          trainerId: TRAINER_USER_ID,
        },
        TRAINEE_USER_ID,
        'trainee',
        threadStore,
        messageStore,
      );

    const threadList: MessageThreadListItem[] = await listMessageThreads(
      TRAINER_USER_ID,
      TRAINEE_USER_ID,
      TRAINEE_USER_ID,
      'trainee',
      threadStore,
      messageStore,
    );

    const history: ThreadChatMessage[] = await listThreadChatMessages(
      TRAINER_USER_ID,
      TRAINEE_USER_ID,
      sendResult.thread.id,
      TRAINEE_USER_ID,
      'trainee',
      threadStore,
      messageStore,
    );

    const latestMessage = latestThreadChatMessage(history);
    const viewportAnchor = selectThreadViewportAnchorMessage(history);

    expect(history).toHaveLength(1);
    expect(isThreadHistoryViewportAnchored(history)).toBe(true);
    expect(history[history.length - 1]).toEqual(latestMessage);
    expect(history[history.length - 1]).toEqual(viewportAnchor);
    expect(history[history.length - 1]?.createdAt).toBe(
      sendResult.message.createdAt,
    );
    expect(threadList[0]?.thread.updatedAt).toBe(
      history[history.length - 1]?.createdAt,
    );
  });

  it.each([
    {
      role: 'trainee' as const,
      userId: TRAINEE_USER_ID,
      label: '新卒コンテキスト',
    },
    {
      role: 'trainer' as const,
      userId: TRAINER_USER_ID,
      label: 'トレーナーコンテキスト',
    },
  ])(
    'listThreadChatMessages_$labelでトレーナー返信後_履歴末尾が最新メッセージかつupdatedAtと一致する',
    async ({ role, userId }) => {
      const initialResult: SendTemplateMessageResult =
        await sendTraineeTemplateMessage(
          {
            templateId: QUESTION_TEMPLATE_TQ1_ID,
            trainerId: TRAINER_USER_ID,
          },
          TRAINEE_USER_ID,
          'trainee',
          threadStore,
          messageStore,
        );

      vi.setSystemTime(U_M18_REPLY_SENT_AT);

      const replyResult: SendTrainerTemplateReplyResult =
        await sendTrainerTemplateReply(
          {
            threadId: initialResult.thread.id,
            templateId: REPLY_TEMPLATE_TT2_ID,
          },
          TRAINER_USER_ID,
          'trainer',
          threadStore,
          messageStore,
        );

      const threadList: MessageThreadListItem[] = await listMessageThreads(
        TRAINER_USER_ID,
        TRAINEE_USER_ID,
        userId,
        role,
        threadStore,
        messageStore,
      );

      const history: ThreadChatMessage[] = await listThreadChatMessages(
        TRAINER_USER_ID,
        TRAINEE_USER_ID,
        initialResult.thread.id,
        userId,
        role,
        threadStore,
        messageStore,
      );

      const latestMessage = latestThreadChatMessage(history);
      const viewportAnchor = selectThreadViewportAnchorMessage(history);

      expect(history).toHaveLength(2);
      expect(isThreadHistoryViewportAnchored(history)).toBe(true);
      expect(history[history.length - 1]).toEqual(latestMessage);
      expect(history[history.length - 1]).toEqual(viewportAnchor);
      expect(history[history.length - 1]).toEqual(replyResult.message);
      expect(history[history.length - 1]?.createdAt).toBe(
        replyResult.message.createdAt,
      );
      expect(threadList[0]?.thread.updatedAt).toBe(
        history[history.length - 1]?.createdAt,
      );
      expect(history[history.length - 1]?.createdAt).not.toBe(
        initialResult.message.createdAt,
      );
    },
  );
});

/**
 * U-M19: 未選択からルームを選択
 *
 * 前提条件: `selectedId = null`
 * アクション: `threadId` で選択（`resolveInlineThreadSelection`）
 * 期待結果: 当該 `threadId` が返る（開状態）
 *
 * 結合境界: messageThreadInlineSelection（純関数 / `@ojt-app/shared`）
 * （HTTP 層・hook 連携・E2E は対象外）
 */
describe('U-M19 未選択からルームを選択', () => {
  it.each([
    {
      label: 'thread-a',
      clickedThreadId: U_M19_THREAD_A,
    },
    {
      label: '実在threadId形式',
      clickedThreadId: U_M19_REALISTIC_THREAD_ID,
    },
    {
      label: '別threadId',
      clickedThreadId: U_M21_THREAD_B,
    },
  ])(
    'resolveInlineThreadSelection_未選択から$labelを選択_当該threadIdを返す',
    ({ clickedThreadId }) => {
      const result = resolveInlineThreadSelection(null, clickedThreadId);

      expect(result).toBe(clickedThreadId);
      expect(isInlineThreadDetailOpen(result)).toBe(true);
    },
  );
});

/**
 * U-M20: 同一ルーム再クリックで閉じる
 *
 * 前提条件: `selectedId = 'a'`
 * アクション: 再度 `threadId = 'a'` で選択（`resolveInlineThreadSelection`）
 * 期待結果: `null` が返る（閉状態）
 *
 * 結合境界: messageThreadInlineSelection（純関数 / `@ojt-app/shared`）
 */
describe('U-M20 同一ルーム再クリックで閉じる', () => {
  it.each([
    {
      label: 'thread-a',
      threadId: U_M19_THREAD_A,
    },
    {
      label: '実在threadId形式',
      threadId: U_M19_REALISTIC_THREAD_ID,
    },
    {
      label: '別threadId',
      threadId: U_M21_THREAD_B,
    },
  ])(
    'resolveInlineThreadSelection_選択中の$labelを再クリック_閉状態になる',
    ({ threadId }) => {
      expect(shouldCloseInlineThreadSelection(threadId, threadId)).toBe(true);

      const result = resolveInlineThreadSelection(threadId, threadId);

      expect(result).toBeNull();
      expect(isInlineThreadDetailOpen(result)).toBe(false);
    },
  );
});

/**
 * U-M21: 別ルームクリックで選択切替
 *
 * 前提条件: `selectedId = 'a'`
 * アクション: `threadId = 'b'` で選択（`resolveInlineThreadSelection`）
 * 期待結果: `'b'` が返る（UI 層で閉じ→開の 2 段階）
 *
 * 結合境界: messageThreadInlineSelection（純関数 / `@ojt-app/shared`）
 */
describe('U-M21 別ルームクリックで選択切替', () => {
  it.each([
    {
      label: 'thread-aからthread-b',
      selectedThreadId: U_M19_THREAD_A,
      clickedThreadId: U_M21_THREAD_B,
    },
    {
      label: 'thread-aから実在threadId形式',
      selectedThreadId: U_M19_THREAD_A,
      clickedThreadId: U_M19_REALISTIC_THREAD_ID,
    },
    {
      label: 'thread-bからthread-a',
      selectedThreadId: U_M21_THREAD_B,
      clickedThreadId: U_M19_THREAD_A,
    },
  ])(
    'resolveInlineThreadSelection_$label_切替後に新しいthreadIdで開状態になる',
    ({ selectedThreadId, clickedThreadId }) => {
      expect(
        shouldSwitchInlineThreadSelection(selectedThreadId, clickedThreadId),
      ).toBe(true);
      expect(
        shouldCloseInlineThreadSelection(selectedThreadId, clickedThreadId),
      ).toBe(false);

      const result = resolveInlineThreadSelection(
        selectedThreadId,
        clickedThreadId,
      );

      expect(result).toBe(clickedThreadId);
      expect(isInlineThreadDetailOpen(result)).toBe(true);
    },
  );
});

/**
 * R-M17: インライン詳細パネル状態（純関数）
 *
 * `resolveInlineThreadSelection` の結果を UI 状態（開閉・パネル表示）へ写像する。
 */
describe('R-M17 インライン詳細パネル状態', () => {
  it('resolveInlineMessageThreadDetailState_未選択から選択_開状態の詳細になる', () => {
    const result = resolveInlineMessageThreadDetailState(null, U_M19_THREAD_A);

    expect(result).toEqual({
      inlineDetailThreadId: U_M19_THREAD_A,
      inlineDetailState: MESSAGE_THREAD_INLINE_DETAIL_OPEN_STATE,
      selectedThreadId: U_M19_THREAD_A,
    });
    expect(
      isInlineMessageThreadRowSelected(
        U_M19_THREAD_A,
        result.selectedThreadId,
        result.inlineDetailState,
      ),
    ).toBe(true);
  });

  it('resolveInlineMessageThreadDetailState_同一ルーム再クリック_閉状態の詳細になる', () => {
    const result = resolveInlineMessageThreadDetailState(
      U_M19_THREAD_A,
      U_M19_THREAD_A,
    );

    expect(result).toEqual({
      inlineDetailThreadId: U_M19_THREAD_A,
      inlineDetailState: MESSAGE_THREAD_INLINE_DETAIL_CLOSED_STATE,
      selectedThreadId: null,
    });
    expect(
      isInlineMessageThreadRowSelected(
        U_M19_THREAD_A,
        result.selectedThreadId,
        result.inlineDetailState,
      ),
    ).toBe(false);
  });

  it('shouldClearInlineMessageThreadDetailOnThreadCountIncrease_未選択時のみクリアする', () => {
    expect(
      shouldClearInlineMessageThreadDetailOnThreadCountIncrease(1, 2, {
        inlineDetailThreadId: null,
        inlineDetailState: MESSAGE_THREAD_INLINE_DETAIL_CLOSED_STATE,
        selectedThreadId: null,
      }),
    ).toBe(true);
    expect(
      shouldClearInlineMessageThreadDetailOnThreadCountIncrease(1, 2, {
        inlineDetailThreadId: U_M19_THREAD_A,
        inlineDetailState: MESSAGE_THREAD_INLINE_DETAIL_OPEN_STATE,
        selectedThreadId: U_M19_THREAD_A,
      }),
    ).toBe(false);
  });
});

/**
 * R-M17: インライン詳細パネル選択アクション（純関数）
 *
 * `resolveInlineMessageThreadDetailState` の結果を apply コールバックへ渡す。
 */
describe('R-M17 インライン詳細パネル選択アクション', () => {
  it('applyInlineMessageThreadDetailSelection_同一ルーム再クリック_閉状態を適用する', () => {
    const applyDetailState = vi.fn();

    const result = applyInlineMessageThreadDetailSelection(
      U_M19_THREAD_A,
      U_M19_THREAD_A,
      applyDetailState,
    );

    expect(result).toEqual({
      inlineDetailThreadId: U_M19_THREAD_A,
      inlineDetailState: MESSAGE_THREAD_INLINE_DETAIL_CLOSED_STATE,
      selectedThreadId: null,
    });
    expect(applyDetailState).toHaveBeenCalledTimes(1);
    expect(applyDetailState).toHaveBeenCalledWith(result);
    expect(
      isInlineMessageThreadRowSelected(
        U_M19_THREAD_A,
        result.selectedThreadId,
        result.inlineDetailState,
      ),
    ).toBe(false);
  });
});

/**
 * R-M17: メッセージスレッド一覧のインライン展開（ページング純関数）
 *
 * 一覧 UI は 20 件ずつ表示する。API 契約は変更せず、クライアント側でページングする。
 * ページングの振る舞い詳細は U-M22 を参照。
 *
 * 結合境界: messageThreadListPaging（純関数）
 * （Firestore 結合・E2E は対象外）
 */
describe('R-M17 スレッド一覧ページング純関数', () => {
  it('MESSAGE_THREAD_LIST_PAGE_SIZE_20件である', () => {
    expect(MESSAGE_THREAD_LIST_PAGE_SIZE).toBe(20);
  });
});

/**
 * U-M22: 一覧を 20 件ずつページング
 *
 * 前提条件: スレッド 0 / 20 / 21 件
 * アクション: `paginateMessageThreads` で各ページ取得
 * 期待結果: 1 ページ目最大 20 件。21 件目は 2 ページ目先頭。0 件は空配列
 *
 * 結合境界: messageThreadListPaging（純関数 / `@ojt-app/shared`）
 * （Firestore 結合・E2E は対象外）
 */
describe('U-M22 一覧を 20 件ずつページング', () => {
  it('paginateMessageThreads_スレッド0件_空配列を返す', () => {
    const result = paginateMessageThreads([], FIRST_MESSAGE_THREAD_LIST_PAGE);

    expect(isEmptyPaginatedMessageThreads(result)).toBe(true);
    expect(result.items).toEqual([]);
    expect(result.totalPages).toBe(0);
    expect(result.page).toBe(FIRST_MESSAGE_THREAD_LIST_PAGE);
    expect(result.pageSize).toBe(MESSAGE_THREAD_LIST_PAGE_SIZE);
  });

  it('paginateMessageThreads_スレッド20件_1ページ目に20件を返す', () => {
    const threads = createR_M17_THREAD_LIST(
      MESSAGE_THREAD_LIST_PAGE_SIZE,
      TRAINEE_USER_ID,
      TRAINER_USER_ID,
    );

    const result = paginateMessageThreads(
      threads,
      FIRST_MESSAGE_THREAD_LIST_PAGE,
    );

    expect(isEmptyPaginatedMessageThreads(result)).toBe(false);
    expect(result.items).toHaveLength(MESSAGE_THREAD_LIST_PAGE_SIZE);
    expect(result.items[0]?.thread.id).toBe(buildR_M17_THREAD_ID(0));
    expect(result.items[19]?.thread.id).toBe(
      buildR_M17_THREAD_ID(MESSAGE_THREAD_LIST_PAGE_SIZE - 1),
    );
    expect(result.totalItems).toBe(MESSAGE_THREAD_LIST_PAGE_SIZE);
    expect(result.totalPages).toBe(1);
    expect(result.pageSize).toBe(MESSAGE_THREAD_LIST_PAGE_SIZE);
  });

  it('paginateMessageThreads_スレッド21件_2ページ目先頭が21件目である', () => {
    const threads = createR_M17_THREAD_LIST(
      MESSAGE_THREAD_LIST_PAGE_SIZE + 1,
      TRAINEE_USER_ID,
      TRAINER_USER_ID,
    );

    const page1 = paginateMessageThreads(
      threads,
      FIRST_MESSAGE_THREAD_LIST_PAGE,
    );
    const page2 = paginateMessageThreads(
      threads,
      FIRST_MESSAGE_THREAD_LIST_PAGE + 1,
    );

    expect(page1.items).toHaveLength(MESSAGE_THREAD_LIST_PAGE_SIZE);
    expect(page1.totalItems).toBe(MESSAGE_THREAD_LIST_PAGE_SIZE + 1);
    expect(page1.totalPages).toBe(2);

    expect(page2.items).toHaveLength(1);
    expect(page2.items[0]?.thread.id).toBe(
      buildR_M17_THREAD_ID(MESSAGE_THREAD_LIST_PAGE_SIZE),
    );
    expect(page2.page).toBe(FIRST_MESSAGE_THREAD_LIST_PAGE + 1);
    expect(page2.pageSize).toBe(MESSAGE_THREAD_LIST_PAGE_SIZE);
  });
});

/**
 * U-M23: ルーム選択で履歴取得が走る
 *
 * 前提条件: スレッド一覧モック 1 件以上
 * アクション: ルーム行選択（`selectThread` / `applyMessageThreadSelection` 相当）
 * 期待結果: 当該 `threadId` で履歴取得関数が 1 回呼ばれ、選択 ID が更新されること
 *
 * 結合境界: messageThreadSelectionAction → setSelectedThreadId / reloadThreadHistory
 * （React hook・HTTP 層・E2E は対象外）
 */
describe('U-M23 ルーム選択で履歴取得が走る', () => {
  it('applyMessageThreadSelection_ルーム選択_選択ID更新と履歴取得が1回呼ばれる', async () => {
    const { setSelectedThreadId, reloadThreadHistory } =
      createMessageThreadSelectionMocks();

    await applyMessageThreadSelection(
      U_M19_THREAD_A,
      U_M23_TRAINEE_USER,
      setSelectedThreadId,
      reloadThreadHistory,
    );

    expect(setSelectedThreadId).toHaveBeenCalledTimes(1);
    expect(setSelectedThreadId).toHaveBeenCalledWith(U_M19_THREAD_A);
    expect(reloadThreadHistory).toHaveBeenCalledTimes(1);
    expect(reloadThreadHistory).toHaveBeenCalledWith(
      U_M23_TRAINEE_USER,
      U_M19_THREAD_A,
    );
  });

  it('applyMessageThreadSelection_未ログイン_選択IDのみ更新し履歴取得しない', async () => {
    const { setSelectedThreadId, reloadThreadHistory } =
      createMessageThreadSelectionMocks();

    await applyMessageThreadSelection(
      U_M19_THREAD_A,
      null,
      setSelectedThreadId,
      reloadThreadHistory,
    );

    expect(setSelectedThreadId).toHaveBeenCalledTimes(1);
    expect(setSelectedThreadId).toHaveBeenCalledWith(U_M19_THREAD_A);
    expect(reloadThreadHistory).not.toHaveBeenCalled();
  });

  it.each(U_M23_THREAD_SELECTION_CASES)(
    'applyMessageThreadSelection_$labelでルーム選択_当該threadIdで履歴取得する',
    async ({ authUser, threadId }) => {
      const { setSelectedThreadId, reloadThreadHistory } =
        createMessageThreadSelectionMocks();

      await applyMessageThreadSelection(
        threadId,
        authUser,
        setSelectedThreadId,
        reloadThreadHistory,
      );

      expect(setSelectedThreadId).toHaveBeenCalledWith(threadId);
      expect(reloadThreadHistory).toHaveBeenCalledTimes(1);
      expect(reloadThreadHistory).toHaveBeenCalledWith(authUser, threadId);
    },
  );
});

/**
 * U-M24: 選択解除でインライン詳細が非表示状態になる
 *
 * 前提条件: ルーム A 選択済み（表示中）
 * アクション: 同一ルーム再選択（トグル / `selectInlineMessageThread` 相当）
 * 期待結果: `selectedThreadId` が `null` になり、詳細表示用の派生状態が falsy になること
 *
 * 結合境界: messageThreadInlineSelection → messageThreadSelectionAction
 *           → setSelectedThreadId / reloadThreadHistory
 * （React hook・HTTP 層・E2E は対象外）
 */
describe('U-M24 選択解除でインライン詳細が非表示状態になる', () => {
  it('selectInlineMessageThread_選択中ルーム再クリック_選択解除し履歴取得しない', async () => {
    const { setSelectedThreadId, reloadThreadHistory } =
      createMessageThreadSelectionMocks();

    const result = await selectInlineMessageThread(
      U_M19_THREAD_A,
      U_M19_THREAD_A,
      U_M23_TRAINEE_USER,
      setSelectedThreadId,
      reloadThreadHistory,
    );

    expect(result).toBeNull();
    expect(setSelectedThreadId).toHaveBeenCalledTimes(1);
    expect(setSelectedThreadId).toHaveBeenCalledWith(null);
    expect(isInlineThreadDetailOpen(result)).toBe(false);
    expect(reloadThreadHistory).not.toHaveBeenCalled();
  });

  it('selectInlineMessageThread_未ログインで再クリック_選択解除のみ行う', async () => {
    const { setSelectedThreadId, reloadThreadHistory } =
      createMessageThreadSelectionMocks();

    const result = await selectInlineMessageThread(
      U_M19_THREAD_A,
      U_M19_THREAD_A,
      null,
      setSelectedThreadId,
      reloadThreadHistory,
    );

    expect(result).toBeNull();
    expect(setSelectedThreadId).toHaveBeenCalledTimes(1);
    expect(setSelectedThreadId).toHaveBeenCalledWith(null);
    expect(isInlineThreadDetailOpen(result)).toBe(false);
    expect(reloadThreadHistory).not.toHaveBeenCalled();
  });

  it.each(U_M24_INLINE_DESELECT_CASES)(
    'selectInlineMessageThread_$labelで同一ルーム再選択_詳細非表示になる',
    async ({ authUser, selectedThreadId, clickedThreadId }) => {
      const { setSelectedThreadId, reloadThreadHistory } =
        createMessageThreadSelectionMocks();

      const result = await selectInlineMessageThread(
        clickedThreadId,
        selectedThreadId,
        authUser,
        setSelectedThreadId,
        reloadThreadHistory,
      );

      expect(result).toBeNull();
      expect(setSelectedThreadId).toHaveBeenCalledWith(null);
      expect(isInlineThreadDetailOpen(result)).toBe(false);
      expect(reloadThreadHistory).not.toHaveBeenCalled();
    },
  );
});

/**
 * U-M-RT01: 新規メッセージのプッシュ通知受信
 *
 * 前提条件: 新卒・トレーナーの 2 クライアント（本ケースはトレーナー側コールバックをモック）
 * アクション: 新卒がメッセージ送信（`POST /api/status/messages` 相当）
 * 期待結果: トレーナー側の購読処理が新着を受け取り、コールバックが 1 回呼ばれること
 *
 * 結合境界: messageFacade → messageService → MessageRealtimeHub（購読）/ MessageThreadStore / ThreadChatMessageStore
 * （本ケースはストアとリアルタイムハブをモックした単体テスト。HTTP 層は対象外）
 */
describe('U-M-RT01 新規メッセージのプッシュ通知受信', () => {
  let threadStore: MessageThreadStore;
  let messageStore: ThreadChatMessageStore;
  let realtimeHub: MessageRealtimeHub;

  beforeEach(() => {
    threadStore = createMockMessageThreadStore({ getById: vi.fn() });
    messageStore = {
      append: vi.fn().mockResolvedValue(undefined),
      listByThreadId: vi.fn().mockResolvedValue([]),
    };
    realtimeHub = createMessageRealtimeHub();
  });

  it('subscribeToMessageUpdates_新卒送信_トレーナーコールバックが1回呼ばれる', async () => {
    const onMessageUpdate = vi.fn<(event: MessageUpdateEvent) => void>();

    const unsubscribe = realtimeHub.subscribe(
      TRAINER_USER_ID,
      TRAINEE_USER_ID,
      TRAINER_USER_ID,
      'trainer',
      onMessageUpdate,
    );

    expect(onMessageUpdate).not.toHaveBeenCalled();

    const result: SendTemplateMessageResult = await sendTraineeTemplateMessage(
      {
        templateId: QUESTION_TEMPLATE_TQ1_ID,
        trainerId: TRAINER_USER_ID,
      },
      TRAINEE_USER_ID,
      'trainee',
      threadStore,
      messageStore,
      realtimeHub,
    );

    const expectedEvent: MessageUpdateEvent = {
      type: 'message.created',
      thread: result.thread,
      message: result.message,
    };

    expect(onMessageUpdate).toHaveBeenCalledTimes(1);
    expect(onMessageUpdate).toHaveBeenCalledWith(expectedEvent);

    unsubscribe();
  });
});

/**
 * U-M-RT02: 返信のプッシュ通知受信
 *
 * 前提条件: 新卒・トレーナーの 2 クライアント（本ケースは新卒側コールバックをモック）、U-M01 でスレッド存在
 * アクション: トレーナーがスタンプ ST1 で返信（`POST /api/status/messages` 相当）
 * 期待結果: 新卒側の購読処理が返信を受け取り、コールバックが 1 回呼ばれること
 *
 * 結合境界: messageFacade → messageService → MessageRealtimeHub（購読）/ MessageThreadStore / ThreadChatMessageStore
 * （本ケースはストアとリアルタイムハブをモックした単体テスト。HTTP 層は対象外）
 */
describe('U-M-RT02 返信のプッシュ通知受信', () => {
  let threadStore: MessageThreadStore;
  let messageStore: ThreadChatMessageStore;
  let realtimeHub: MessageRealtimeHub;

  beforeEach(() => {
    threadStore = createMockMessageThreadStore({
      create: vi.fn(),
      listByParticipants: vi.fn(),
    });
    messageStore = {
      append: vi.fn().mockResolvedValue(undefined),
      listByThreadId: vi.fn().mockResolvedValue([U_M01_HEAD_MESSAGE]),
    };
    realtimeHub = createMessageRealtimeHub();
  });

  it('subscribeToMessageUpdates_トレーナースタンプ返信_新卒コールバックが1回呼ばれる', async () => {
    const onMessageUpdate = vi.fn<(event: MessageUpdateEvent) => void>();

    const unsubscribe = realtimeHub.subscribe(
      TRAINER_USER_ID,
      TRAINEE_USER_ID,
      TRAINEE_USER_ID,
      'trainee',
      onMessageUpdate,
    );

    expect(onMessageUpdate).not.toHaveBeenCalled();

    const result: SendTrainerStampReplyResult = await sendTrainerStampReply(
      {
        threadId: CREATED_THREAD.id,
        stampId: STAMP_ST1_ID,
      },
      TRAINER_USER_ID,
      'trainer',
      threadStore,
      messageStore,
      realtimeHub,
    );

    const expectedEvent: MessageUpdateEvent = {
      type: 'message.created',
      thread: result.thread,
      message: result.message,
    };

    expect(onMessageUpdate).toHaveBeenCalledTimes(1);
    expect(onMessageUpdate).toHaveBeenCalledWith(expectedEvent);

    unsubscribe();
  });
});

/**
 * U-M-RT03: 再接続後の差分同期
 *
 * 前提条件: トレーナーが一度購読を解除（切断）し、切断前の最終受信を `lastSeenMessageId` として保持
 * アクション: 切断中に蓄積されたメッセージを `syncMissedMessageUpdates` で再取得（再接続）
 * 期待結果: `lastSeenMessageId` 以降のメッセージが欠落なく時系列で復元されること
 *
 * 結合境界: messageFacade → messageService → MessageThreadStore / ThreadChatMessageStore
 * （本ケースはストアをモックした単体テスト。HTTP 層は対象外）
 */
describe('U-M-RT03 再接続後の差分同期', () => {
  let threadStore: MessageThreadStore;
  let messageStore: ThreadChatMessageStore;
  let realtimeHub: MessageRealtimeHub;
  let persistedMessages: ThreadChatMessage[];

  beforeEach(() => {
    persistedMessages = [U_M01_HEAD_MESSAGE];
    threadStore = createMockMessageThreadStore({
      create: vi.fn(),
      listByParticipants: vi.fn(),
    });
    messageStore = {
      append: vi.fn().mockImplementation(async (message: ThreadChatMessage) => {
        persistedMessages.push(message);
      }),
      listByThreadId: vi
        .fn()
        .mockImplementation(async () => [...persistedMessages]),
    };
    realtimeHub = createMessageRealtimeHub();
  });

  it('syncMissedMessageUpdates_切断中の2件_lastSeen以降が欠落なく復元される', async () => {
    const onMessageUpdate = vi.fn<(event: MessageUpdateEvent) => void>();

    const unsubscribe = realtimeHub.subscribe(
      TRAINER_USER_ID,
      TRAINEE_USER_ID,
      TRAINER_USER_ID,
      'trainer',
      onMessageUpdate,
    );

    unsubscribe();

    const templateReplyResult: SendTrainerTemplateReplyResult =
      await sendTrainerTemplateReply(
        {
          threadId: CREATED_THREAD.id,
          templateId: REPLY_TEMPLATE_TT2_ID,
        },
        TRAINER_USER_ID,
        'trainer',
        threadStore,
        messageStore,
      );

    const stampReplyResult: SendTrainerStampReplyResult =
      await sendTrainerStampReply(
        {
          threadId: CREATED_THREAD.id,
          stampId: STAMP_ST1_ID,
        },
        TRAINER_USER_ID,
        'trainer',
        threadStore,
        messageStore,
      );

    expect(onMessageUpdate).not.toHaveBeenCalled();

    await syncMissedMessageUpdates(
      {
        trainerId: TRAINER_USER_ID,
        traineeId: TRAINEE_USER_ID,
        threadId: CREATED_THREAD.id,
        lastSeenMessageId: U_M01_HEAD_MESSAGE.id,
      },
      TRAINER_USER_ID,
      'trainer',
      threadStore,
      messageStore,
      onMessageUpdate,
    );

    const expectedTemplateEvent: MessageUpdateEvent = {
      type: 'message.created',
      thread: templateReplyResult.thread,
      message: templateReplyResult.message,
    };
    const expectedStampEvent: MessageUpdateEvent = {
      type: 'message.created',
      thread: stampReplyResult.thread,
      message: stampReplyResult.message,
    };

    expect(onMessageUpdate).toHaveBeenCalledTimes(2);
    expect(onMessageUpdate).toHaveBeenNthCalledWith(1, expectedTemplateEvent);
    expect(onMessageUpdate).toHaveBeenNthCalledWith(2, expectedStampEvent);
    expect(messageStore.listByThreadId).toHaveBeenCalledWith(CREATED_THREAD.id);
  });
});

/**
 * U-M-RT04: ポーリング間隔の遵守
 *
 * 前提条件: ポーリング方式を採用し、設定間隔（5 秒）で差分取得をスケジュール
 * アクション: 12 秒待機
 * 期待結果: 設定間隔を下回る頻度で過剰な poll が発生しないこと
 *
 * 結合境界: messageFacade → createMessageUpdatePoller（ポーリング制御）
 * （本ケースは poll コールバックをモックした単体テスト。HTTP 層は対象外）
 */
describe('U-M-RT04 ポーリング間隔の遵守', () => {
  const MESSAGE_UPDATE_POLL_WAIT_DURATION_MS = 12_000;

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('createMessageUpdatePoller_12秒待機_5秒間隔を下回る頻度でpollが呼ばれない', async () => {
    const onPoll = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);

    const poller = createMessageUpdatePoller({
      intervalMs: MESSAGE_UPDATE_POLL_INTERVAL_MS,
      poll: onPoll,
    });

    poller.start();

    const pollsAfterStart = onPoll.mock.calls.length;

    await vi.advanceTimersByTimeAsync(MESSAGE_UPDATE_POLL_INTERVAL_MS - 1);
    expect(onPoll).toHaveBeenCalledTimes(pollsAfterStart);

    await vi.advanceTimersByTimeAsync(1);
    expect(onPoll).toHaveBeenCalledTimes(pollsAfterStart + 1);

    await vi.advanceTimersByTimeAsync(
      MESSAGE_UPDATE_POLL_WAIT_DURATION_MS - MESSAGE_UPDATE_POLL_INTERVAL_MS,
    );
    poller.stop();

    const maxAllowedPolls =
      Math.floor(
        MESSAGE_UPDATE_POLL_WAIT_DURATION_MS / MESSAGE_UPDATE_POLL_INTERVAL_MS,
      ) + 1;

    expect(onPoll.mock.calls.length).toBeLessThanOrEqual(maxAllowedPolls);
  });
});

const describeFirestore = process.env.FIRESTORE_EMULATOR_HOST
  ? describe
  : describe.skip;

/**
 * I-M01: スレッド作成とメッセージ永続化
 *
 * 前提条件: Firestore Emulator 起動、`DB_PROVIDER=firestore` 相当の永続化層
 * アクション: 新卒がテンプレート TQ1 で新規送信（`POST /api/status/messages` 相当）
 * 期待結果: `chat_threads` と `chat_messages` にドキュメントが作成されること
 *
 * 結合境界: messageFacade → messageService → FirestoreMessageThreadStore / FirestoreThreadChatMessageStore → Firestore Emulator
 * （Emulator 未起動時は skip。HTTP 層は対象外）
 */
describeFirestore('Firestore Message 結合テスト', () => {
  beforeEach(async () => {
    await prepareFirestoreMessageTestEnvironment();
  });

  afterEach(() => {
    resetFirestoreForTests();
  });

  it('I-M01 sendTraineeTemplateMessage_新卒TQ1送信_chat_threadsとchat_messagesに永続化される', async () => {
    const { db, threadStore, messageStore } =
      createFirestoreMessageTestStores();

    const result: SendTemplateMessageResult = await sendTraineeTq1NewThread(
      TRAINEE_USER_ID,
      TRAINER_USER_ID,
      threadStore,
      messageStore,
    );

    const threadDoc = await db
      .collection(FIRESTORE_COLLECTIONS.CHAT_THREADS)
      .doc(result.thread.id)
      .get();
    const messagesSnapshot = await db
      .collection(FIRESTORE_COLLECTIONS.THREAD_CHAT_MESSAGES)
      .where('threadId', '==', result.thread.id)
      .get();

    expect(threadDoc.exists).toBe(true);
    expect(threadDoc.data()).toEqual(
      expect.objectContaining({
        traineeId: TRAINEE_USER_ID,
        trainerId: TRAINER_USER_ID,
      }),
    );
    expect(threadDoc.data()?.createdAt).toEqual(expect.any(String));
    expect(threadDoc.data()?.updatedAt).toEqual(expect.any(String));

    expect(messagesSnapshot.docs).toHaveLength(1);
    expect(messagesSnapshot.docs[0]?.id).toBe(result.message.id);
    expect(messagesSnapshot.docs[0]?.data()).toEqual(
      expect.objectContaining({
        threadId: result.thread.id,
        senderId: TRAINEE_USER_ID,
        receiverId: TRAINER_USER_ID,
        content: QUESTION_TEMPLATE_TQ1_CONTENT,
        type: 'template',
        templateId: QUESTION_TEMPLATE_TQ1_ID,
      }),
    );
    expect(messagesSnapshot.docs[0]?.data()?.createdAt).toEqual(
      expect.any(String),
    );

    expect(result.thread.traineeId).toBe(TRAINEE_USER_ID);
    expect(result.thread.trainerId).toBe(TRAINER_USER_ID);
    expect(result.message.threadId).toBe(result.thread.id);
    expect(result.message.type).toBe('template');
    expect(result.message.content).toBe(QUESTION_TEMPLATE_TQ1_CONTENT);
    expect(result.message.templateId).toBe(QUESTION_TEMPLATE_TQ1_ID);
  });

  /**
   * I-M02: スレッドへの返信永続化
   *
   * 前提条件: I-M01 完了（スレッドと先頭メッセージが存在）、Firestore Emulator 起動
   * アクション: トレーナーが同一スレッドにスタンプ ST1 で返信（`POST /api/status/messages` 相当）
   * 期待結果: `threadId` が一致する 2 件目のメッセージが `chat_messages` に存在すること
   */
  it('I-M02 sendTrainerStampReply_トレーナーST1返信_同一threadIdの2件目がchat_messagesに永続化される', async () => {
    const { db, threadStore, messageStore } =
      createFirestoreMessageTestStores();

    const { initialResult, replyResult } = await sendIm02Conversation(
      TRAINEE_USER_ID,
      TRAINER_USER_ID,
      threadStore,
      messageStore,
    );

    const threadsSnapshot = await db
      .collection(FIRESTORE_COLLECTIONS.CHAT_THREADS)
      .get();
    const messagesSnapshot = await db
      .collection(FIRESTORE_COLLECTIONS.THREAD_CHAT_MESSAGES)
      .where('threadId', '==', initialResult.thread.id)
      .get();
    const threadMessages: ThreadChatMessage[] = await listThreadChatMessages(
      TRAINER_USER_ID,
      TRAINEE_USER_ID,
      initialResult.thread.id,
      TRAINER_USER_ID,
      'trainer',
      threadStore,
      messageStore,
    );

    expect(threadsSnapshot.docs).toHaveLength(1);
    expect(messagesSnapshot.docs).toHaveLength(2);
    expect(replyResult.thread.id).toBe(initialResult.thread.id);
    expect(replyResult.message.threadId).toBe(initialResult.thread.id);
    expect(replyResult.message.type).toBe('stamp');
    expect(replyResult.message.content).toBe(STAMP_ST1_CONTENT);

    expect(threadMessages).toHaveLength(2);
    expect(threadMessages[0]?.id).toBe(initialResult.message.id);
    expect(threadMessages[0]?.threadId).toBe(initialResult.thread.id);
    expect(threadMessages[0]?.type).toBe('template');
    expect(threadMessages[1]?.id).toBe(replyResult.message.id);
    expect(threadMessages[1]?.threadId).toBe(initialResult.thread.id);
    expect(threadMessages[1]?.senderId).toBe(TRAINER_USER_ID);
    expect(threadMessages[1]?.receiverId).toBe(TRAINEE_USER_ID);
    expect(threadMessages[1]?.type).toBe('stamp');
    expect(threadMessages[1]?.content).toBe(STAMP_ST1_CONTENT);
  });

  /**
   * I-M03: 再起動後もスレッドが維持
   *
   * 前提条件: I-M02 完了（スレッド + 先頭メッセージ + スタンプ返信が Firestore に永続化済み）
   * アクション: 永続化層を再起動（クライアント再生成）したうえで、新卒・トレーナーそれぞれ一覧取得
   * 期待結果: スレッドとメッセージ履歴が欠落なく取得できること
   *
   * 結合境界: messageFacade → messageService → FirestoreMessageThreadStore / FirestoreThreadChatMessageStore → Firestore Emulator
   * （Emulator 未起動時は skip。HTTP 層は対象外）
   */
  it('I-M03 restartPersistence_新卒トレーナー一覧取得_スレッドと履歴が欠落なく取得できる', async () => {
    const { threadStore, messageStore } = createFirestoreMessageTestStores();

    const { initialResult, replyResult } = await sendIm02Conversation(
      TRAINEE_USER_ID,
      TRAINER_USER_ID,
      threadStore,
      messageStore,
    );

    const {
      threadStore: reloadedThreadStore,
      messageStore: reloadedMessageStore,
    } = reconnectFirestoreMessagePersistence();

    const traineeThreadList: MessageThreadListItem[] = await listMessageThreads(
      TRAINER_USER_ID,
      TRAINEE_USER_ID,
      TRAINEE_USER_ID,
      'trainee',
      reloadedThreadStore,
      reloadedMessageStore,
    );
    const trainerThreadList: MessageThreadListItem[] = await listMessageThreads(
      TRAINER_USER_ID,
      TRAINEE_USER_ID,
      TRAINER_USER_ID,
      'trainer',
      reloadedThreadStore,
      reloadedMessageStore,
    );
    const traineeHistory: ThreadChatMessage[] = await listThreadChatMessages(
      TRAINER_USER_ID,
      TRAINEE_USER_ID,
      initialResult.thread.id,
      TRAINEE_USER_ID,
      'trainee',
      reloadedThreadStore,
      reloadedMessageStore,
    );
    const trainerHistory: ThreadChatMessage[] = await listThreadChatMessages(
      TRAINER_USER_ID,
      TRAINEE_USER_ID,
      initialResult.thread.id,
      TRAINER_USER_ID,
      'trainer',
      reloadedThreadStore,
      reloadedMessageStore,
    );

    expect(traineeThreadList).toHaveLength(1);
    expect(trainerThreadList).toHaveLength(1);
    expect(traineeThreadList[0]?.thread.id).toBe(initialResult.thread.id);
    expect(trainerThreadList[0]?.thread.id).toBe(initialResult.thread.id);
    expect(traineeThreadList[0]?.thread.traineeId).toBe(TRAINEE_USER_ID);
    expect(traineeThreadList[0]?.thread.trainerId).toBe(TRAINER_USER_ID);
    expect(traineeThreadList[0]?.firstMessage.id).toBe(
      initialResult.message.id,
    );
    expect(traineeThreadList[0]?.firstMessage.threadId).toBe(
      initialResult.thread.id,
    );
    expect(traineeThreadList[0]?.firstMessage.type).toBe('template');
    expect(traineeThreadList[0]?.firstMessage.content).toBe(
      QUESTION_TEMPLATE_TQ1_CONTENT,
    );
    expect(trainerThreadList[0]?.firstMessage).toEqual(
      traineeThreadList[0]?.firstMessage,
    );

    expect(traineeHistory).toHaveLength(2);
    expect(trainerHistory).toHaveLength(2);
    expect(traineeHistory).toEqual(trainerHistory);
    expect(traineeHistory[0]?.id).toBe(initialResult.message.id);
    expect(traineeHistory[0]?.threadId).toBe(initialResult.thread.id);
    expect(traineeHistory[0]?.senderId).toBe(TRAINEE_USER_ID);
    expect(traineeHistory[0]?.receiverId).toBe(TRAINER_USER_ID);
    expect(traineeHistory[0]?.type).toBe('template');
    expect(traineeHistory[0]?.content).toBe(QUESTION_TEMPLATE_TQ1_CONTENT);
    expect(traineeHistory[0]?.templateId).toBe(QUESTION_TEMPLATE_TQ1_ID);
    expect(traineeHistory[1]?.id).toBe(replyResult.message.id);
    expect(traineeHistory[1]?.threadId).toBe(initialResult.thread.id);
    expect(traineeHistory[1]?.senderId).toBe(TRAINER_USER_ID);
    expect(traineeHistory[1]?.receiverId).toBe(TRAINEE_USER_ID);
    expect(traineeHistory[1]?.type).toBe('stamp');
    expect(traineeHistory[1]?.content).toBe(STAMP_ST1_CONTENT);
  });

  /**
   * I-M04: 複数スレッドの並存
   *
   * 前提条件: Firestore Emulator 起動
   * アクション: 新卒が異なる内容（TQ1 テンプレート + 自由記述）で 2 回新規送信し、トレーナーが一覧取得
   * 期待結果: 2 つのスレッドが区別され、それぞれに先頭メッセージが紐づくこと
   *
   * 結合境界: messageFacade → messageService → FirestoreMessageThreadStore / FirestoreThreadChatMessageStore → Firestore Emulator
   * （Emulator 未起動時は skip。HTTP 層は対象外）
   */
  it('I-M04 listMessageThreads_新卒2回新規送信_2スレッドが区別され先頭メッセージが紐づく', async () => {
    const { db, threadStore, messageStore } =
      createFirestoreMessageTestStores();

    const { firstResult, secondResult } = await sendIm04TwoNewThreads(
      TRAINEE_USER_ID,
      TRAINER_USER_ID,
      I_M04_SECOND_MESSAGE_CONTENT,
      threadStore,
      messageStore,
    );

    const trainerThreadList: MessageThreadListItem[] = await listMessageThreads(
      TRAINER_USER_ID,
      TRAINEE_USER_ID,
      TRAINER_USER_ID,
      'trainer',
      threadStore,
      messageStore,
    );
    const threadsSnapshot = await db
      .collection(FIRESTORE_COLLECTIONS.CHAT_THREADS)
      .get();
    const messagesSnapshot = await db
      .collection(FIRESTORE_COLLECTIONS.THREAD_CHAT_MESSAGES)
      .get();

    expect(threadsSnapshot.docs).toHaveLength(2);
    expect(messagesSnapshot.docs).toHaveLength(2);
    expect(trainerThreadList).toHaveLength(2);
    expect(firstResult.thread.id).not.toBe(secondResult.thread.id);

    const firstThreadItem = findMessageThreadListItem(
      trainerThreadList,
      firstResult.thread.id,
    );
    const secondThreadItem = findMessageThreadListItem(
      trainerThreadList,
      secondResult.thread.id,
    );

    expect(firstThreadItem).toBeDefined();
    expect(secondThreadItem).toBeDefined();
    expect(firstThreadItem?.firstMessage.id).toBe(firstResult.message.id);
    expect(firstThreadItem?.firstMessage.threadId).toBe(firstResult.thread.id);
    expect(firstThreadItem?.firstMessage.type).toBe('template');
    expect(firstThreadItem?.firstMessage.content).toBe(
      QUESTION_TEMPLATE_TQ1_CONTENT,
    );
    expect(firstThreadItem?.firstMessage.templateId).toBe(
      QUESTION_TEMPLATE_TQ1_ID,
    );
    expect(secondThreadItem?.firstMessage.id).toBe(secondResult.message.id);
    expect(secondThreadItem?.firstMessage.threadId).toBe(
      secondResult.thread.id,
    );
    expect(secondThreadItem?.firstMessage.type).toBe('text');
    expect(secondThreadItem?.firstMessage.content).toBe(
      I_M04_SECOND_MESSAGE_CONTENT,
    );
  });

  /**
   * I-M05: ルーム一覧の並び順
   *
   * 前提条件: Firestore Emulator 起動、新卒が時間差を空けて 2 回新規送信済み
   * アクション: 新卒・トレーナーそれぞれ一覧取得（`listMessageThreads`）
   * 期待結果: `updatedAt` 降順で並び、直近送信ルームが先頭であること
   *
   * 結合境界: messageFacade → messageService → FirestoreMessageThreadStore / FirestoreThreadChatMessageStore → Firestore Emulator
   * （Emulator 未起動時は skip。HTTP 層は対象外）
   *
   * 単体ケース U-M14・要件 R-M09 と重複するが、Firestore 永続化層での要件 ID 単位の網羅を目的とする。
   */
  it.each([
    {
      role: 'trainee' as const,
      userId: TRAINEE_USER_ID,
      label: '新卒コンテキスト',
    },
    {
      role: 'trainer' as const,
      userId: TRAINER_USER_ID,
      label: 'トレーナーコンテキスト',
    },
  ])(
    'I-M05 listMessageThreads_$labelで2回新規送信後_updatedAt降順で直近送信ルームが先頭',
    async ({ role, userId }) => {
      vi.useFakeTimers();
      vi.setSystemTime(I_M05_FIRST_SENT_AT);

      try {
        const { db, threadStore, messageStore } =
          createFirestoreMessageTestStores();

        const firstResult: SendTemplateMessageResult =
          await sendTraineeTemplateMessage(
            {
              templateId: QUESTION_TEMPLATE_TQ1_ID,
              trainerId: TRAINER_USER_ID,
            },
            TRAINEE_USER_ID,
            'trainee',
            threadStore,
            messageStore,
          );

        vi.setSystemTime(I_M05_SECOND_SENT_AT);

        const secondResult: SendTextMessageResult =
          await sendTraineeTextMessage(
            {
              content: I_M05_SECOND_MESSAGE_CONTENT,
              trainerId: TRAINER_USER_ID,
            },
            TRAINEE_USER_ID,
            'trainee',
            threadStore,
            messageStore,
          );

        const threadList: MessageThreadListItem[] = await listMessageThreads(
          TRAINER_USER_ID,
          TRAINEE_USER_ID,
          userId,
          role,
          threadStore,
          messageStore,
        );
        const threadsSnapshot = await db
          .collection(FIRESTORE_COLLECTIONS.CHAT_THREADS)
          .get();
        const firstThreadDoc = await db
          .collection(FIRESTORE_COLLECTIONS.CHAT_THREADS)
          .doc(firstResult.thread.id)
          .get();
        const secondThreadDoc = await db
          .collection(FIRESTORE_COLLECTIONS.CHAT_THREADS)
          .doc(secondResult.thread.id)
          .get();

        expect(threadsSnapshot.docs).toHaveLength(2);
        expect(threadList).toHaveLength(2);
        expect(threadList[0]?.thread.id).toBe(secondResult.thread.id);
        expect(threadList[1]?.thread.id).toBe(firstResult.thread.id);
        expect(
          new Date(threadList[0]!.thread.updatedAt).getTime(),
        ).toBeGreaterThan(new Date(threadList[1]!.thread.updatedAt).getTime());
        expect(threadList[0]?.thread.updatedAt).toBe(
          secondResult.thread.updatedAt,
        );
        expect(threadList[1]?.thread.updatedAt).toBe(
          firstResult.thread.updatedAt,
        );

        expect(firstThreadDoc.exists).toBe(true);
        expect(secondThreadDoc.exists).toBe(true);
        expect(
          new Date(secondThreadDoc.data()?.updatedAt as string).getTime(),
        ).toBeGreaterThan(
          new Date(firstThreadDoc.data()?.updatedAt as string).getTime(),
        );
        expect(secondThreadDoc.data()?.updatedAt).toBe(
          secondResult.thread.updatedAt,
        );
        expect(firstThreadDoc.data()?.updatedAt).toBe(
          firstResult.thread.updatedAt,
        );
      } finally {
        vi.useRealTimers();
      }
    },
  );
});
