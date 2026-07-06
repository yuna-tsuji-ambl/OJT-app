import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getTrainerStatus,
  sendQuickQuestion,
  sendQuickReply,
  updateTrainerStatus,
  type ChatMessage,
  type ChatMessageStore,
  type TrainerStatusRecord,
  type TrainerStatusStore,
  type TrainerStatusType,
} from '../status.js';

/**
 * U-S01: トレーナーステータスの変更
 * 前提条件: OJTトレーナーとしてログイン中
 * アクション: ステータス切り替えトグルで「集中モード」を選択する
 * 期待結果: 自身のステータス表示が「集中モード」に変更され、サーバーに変更リクエストが送られること
 */
describe('U-S01 トレーナーステータスの変更', () => {
  const trainerUserId = 'trainer-1';
  const focusModeStatus: TrainerStatusType = '集中モード';

  let trainerStatusStore: TrainerStatusStore;

  beforeEach(() => {
    trainerStatusStore = {
      getByUserId: vi.fn().mockResolvedValue({
        userId: trainerUserId,
        status: '質問OK',
      } satisfies TrainerStatusRecord),
      update: vi.fn().mockResolvedValue(undefined),
    };
  });

  it('updateTrainerStatus_トレーナー集中モード選択_ステータスが更新されサーバーに保存される', async () => {
    const result = await updateTrainerStatus(
      focusModeStatus,
      trainerUserId,
      'trainer',
      trainerStatusStore,
    );

    expect(trainerStatusStore.update).toHaveBeenCalledWith(
      trainerUserId,
      focusModeStatus,
    );
    expect(result.userId).toBe(trainerUserId);
    expect(result.status).toBe('集中モード');
  });
});

/**
 * U-S02: トレーナーステータスの確認
 * 前提条件: 新卒ユーザーとしてログイン中
 * アクション: ホーム画面を開く
 * 期待結果: 先輩（トレーナー）の現在のステータスが正しくアイコン/テキストで表示されること
 */
describe('U-S02 トレーナーステータスの確認', () => {
  const traineeUserId = 'trainee-1';
  const trainerUserId = 'trainer-1';

  let trainerStatusStore: TrainerStatusStore;

  beforeEach(() => {
    trainerStatusStore = {
      getByUserId: vi.fn().mockResolvedValue({
        userId: trainerUserId,
        status: '質問OK',
      } satisfies TrainerStatusRecord),
      update: vi.fn().mockResolvedValue(undefined),
    };
  });

  it('getTrainerStatus_新卒ホーム画面_トレーナーの現在ステータスが返る', async () => {
    const result = await getTrainerStatus(
      trainerUserId,
      traineeUserId,
      'trainee',
      trainerStatusStore,
    );

    expect(trainerStatusStore.getByUserId).toHaveBeenCalledWith(trainerUserId);
    expect(result.userId).toBe(trainerUserId);
    expect(result.status).toBe('質問OK');
  });
});

/**
 * U-S03: クイック質問の送信
 * 前提条件: 新卒ユーザーとしてログイン中
 * アクション: 質問テンプレート（例:「〇〇の件で3分いいですか？」）を選択し、送信ボタンを押す
 * 期待結果: 質問メッセージが送信され、チャット履歴に追加されること
 */
describe('U-S03 クイック質問の送信', () => {
  const traineeUserId = 'trainee-1';
  const trainerUserId = 'trainer-1';
  const templateMessage = '〇〇の件で3分いいですか？';

  let chatMessageStore: ChatMessageStore;

  beforeEach(() => {
    chatMessageStore = {
      append: vi.fn().mockResolvedValue(undefined),
    };
  });

  it('sendQuickQuestion_新卒テンプレート送信_質問がチャット履歴に追加される', async () => {
    const result = await sendQuickQuestion(
      templateMessage,
      trainerUserId,
      traineeUserId,
      'trainee',
      chatMessageStore,
    );

    const expectedMessage: ChatMessage = {
      senderId: traineeUserId,
      receiverId: trainerUserId,
      content: templateMessage,
      type: 'question',
    };

    expect(chatMessageStore.append).toHaveBeenCalledWith(expectedMessage);
    expect(result.message).toEqual(expectedMessage);
  });
});

/**
 * U-S04: クイック質問の受信と簡易返信
 * 前提条件: OJTトレーナーとしてログイン中
 * アクション: 新卒から質問を受信した状態で、簡易返信スタンプ（例:「後で話そう」）を押す
 * 期待結果: 返信メッセージが送信され、チャット履歴に追加されること
 */
describe('U-S04 クイック質問の受信と簡易返信', () => {
  const traineeUserId = 'trainee-1';
  const trainerUserId = 'trainer-1';
  const replyStamp = '後で話そう';

  let chatMessageStore: ChatMessageStore;

  beforeEach(() => {
    chatMessageStore = {
      append: vi.fn().mockResolvedValue(undefined),
    };
  });

  it('sendQuickReply_トレーナー簡易返信スタンプ_返信がチャット履歴に追加される', async () => {
    const result = await sendQuickReply(
      replyStamp,
      traineeUserId,
      trainerUserId,
      'trainer',
      chatMessageStore,
    );

    const expectedMessage: ChatMessage = {
      senderId: trainerUserId,
      receiverId: traineeUserId,
      content: replyStamp,
      type: 'reply',
    };

    expect(chatMessageStore.append).toHaveBeenCalledWith(expectedMessage);
    expect(result.message).toEqual(expectedMessage);
  });
});
