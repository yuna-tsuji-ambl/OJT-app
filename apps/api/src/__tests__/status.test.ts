import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  updateTrainerStatus,
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
