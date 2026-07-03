import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createConditionDraft,
  getConditionAlert,
  getConditionGraphData,
  submitConditionRecord,
  updateMentalValue,
  type ConditionAlert,
  type ConditionDraft,
  type ConditionGraphData,
  type ConditionHistoryRecord,
  type ConditionRecordStore,
} from '../condition.js';

/**
 * U-C01: スライダーの入力とステート更新
 * 前提条件: 新卒ユーザーとしてログイン中
 * アクション: 「メンタル」のスライダーを初期値(3)から「1（しんどい）」に動かす
 * 期待結果: UIが更新され、内部のコンポーネントステート（mental値）が1に更新されること
 */
describe('U-C01 スライダーの入力とステート更新', () => {
  const traineeUserId = 'trainee-1';

  const initialDraft: ConditionDraft = createConditionDraft({
    workload: 3,
    comprehension: 3,
    mental: 3,
  });

  it('updateMentalValue_新卒メンタルスライダー1_mental値が1に更新される', () => {
    const updated = updateMentalValue(
      initialDraft,
      1,
      traineeUserId,
      'trainee',
    );

    expect(updated.mental).toBe(1);
    expect(initialDraft.mental).toBe(3);
    expect(updated.workload).toBe(3);
    expect(updated.comprehension).toBe(3);
  });
});

/**
 * U-C02: 温度計データの送信
 * 前提条件: 新卒ユーザーとしてログイン中
 * アクション: 「業務量」「理解度」「メンタル」を入力し、「記録する」ボタンを押す
 * 期待結果: APIに正しい値が送信され、完了メッセージが表示されること
 */
describe('U-C02 温度計データの送信', () => {
  const traineeUserId = 'trainee-1';

  const inputDraft: ConditionDraft = {
    workload: 4,
    comprehension: 3,
    mental: 1,
  };

  let conditionRecordStore: ConditionRecordStore;

  beforeEach(() => {
    conditionRecordStore = {
      save: vi.fn().mockResolvedValue(undefined),
      findHistoryByTraineeId: vi.fn().mockResolvedValue([]),
    };
  });

  it('submitConditionRecord_新卒入力データ送信_正しい値が保存され完了メッセージが返る', async () => {
    const result = await submitConditionRecord(
      inputDraft,
      traineeUserId,
      'trainee',
      conditionRecordStore,
    );

    expect(conditionRecordStore.save).toHaveBeenCalledWith(
      traineeUserId,
      inputDraft,
    );
    expect(result.record).toEqual(inputDraft);
    expect(result.message).toBe('記録しました');
  });
});

/**
 * U-C03: コンディションのグラフ表示
 * 前提条件: OJTトレーナーとしてログイン中
 * アクション: 対象新卒のコンディション詳細画面を開く
 * 期待結果: 過去の入力データに基づき、3項目の推移グラフが正しく描画されること
 */
describe('U-C03 コンディションのグラフ表示', () => {
  const trainerUserId = 'trainer-1';
  const traineeUserId = 'trainee-1';

  const historyRecords: ConditionHistoryRecord[] = [
    {
      recordedAt: '2026-03-01',
      workload: 3,
      comprehension: 3,
      mental: 3,
    },
    {
      recordedAt: '2026-03-08',
      workload: 4,
      comprehension: 3,
      mental: 2,
    },
    {
      recordedAt: '2026-03-15',
      workload: 4,
      comprehension: 2,
      mental: 1,
    },
  ];

  let conditionRecordStore: ConditionRecordStore;

  beforeEach(() => {
    conditionRecordStore = {
      save: vi.fn().mockResolvedValue(undefined),
      findHistoryByTraineeId: vi.fn().mockResolvedValue(historyRecords),
    };
  });

  it('getConditionGraphData_トレーナー詳細画面_3項目の推移データが返る', async () => {
    const graphData: ConditionGraphData = await getConditionGraphData(
      traineeUserId,
      trainerUserId,
      'trainer',
      conditionRecordStore,
    );

    expect(conditionRecordStore.findHistoryByTraineeId).toHaveBeenCalledWith(
      traineeUserId,
    );
    expect(graphData.labels).toEqual([
      '2026-03-01',
      '2026-03-08',
      '2026-03-15',
    ]);
    expect(graphData.workload).toEqual([3, 4, 4]);
    expect(graphData.comprehension).toEqual([3, 3, 2]);
    expect(graphData.mental).toEqual([3, 2, 1]);
  });
});

/**
 * U-C04: アラートの検知と表示
 * 前提条件: OJTトレーナーとしてログイン中
 * アクション: 新卒の直近の「メンタル」値が「1」の状態でダッシュボードを開く
 * 期待結果: 対象新卒のパネルに目立つ「SOSアラート（例: 要フォロー）」が表示されること
 */
describe('U-C04 アラートの検知と表示', () => {
  const trainerUserId = 'trainer-1';
  const traineeUserId = 'trainee-1';

  const historyWithLowMental: ConditionHistoryRecord[] = [
    {
      recordedAt: '2026-03-01',
      workload: 3,
      comprehension: 3,
      mental: 3,
    },
    {
      recordedAt: '2026-03-15',
      workload: 4,
      comprehension: 2,
      mental: 1,
    },
  ];

  let conditionRecordStore: ConditionRecordStore;

  beforeEach(() => {
    conditionRecordStore = {
      save: vi.fn().mockResolvedValue(undefined),
      findHistoryByTraineeId: vi
        .fn()
        .mockResolvedValue(historyWithLowMental),
    };
  });

  it('getConditionAlert_トレーナーダッシュボード_直近メンタル1でSOSアラートが返る', async () => {
    const alert: ConditionAlert = await getConditionAlert(
      traineeUserId,
      trainerUserId,
      'trainer',
      conditionRecordStore,
    );

    expect(conditionRecordStore.findHistoryByTraineeId).toHaveBeenCalledWith(
      traineeUserId,
    );
    expect(alert.traineeId).toBe(traineeUserId);
    expect(alert.hasAlert).toBe(true);
    expect(alert.latestMental).toBe(1);
    expect(alert.message).toBe('要フォロー');
  });
});
