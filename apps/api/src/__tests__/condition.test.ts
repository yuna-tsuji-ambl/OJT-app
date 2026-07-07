import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createConditionDraft,
  getConditionAlert,
  getConditionGraphData,
  getLatestConditionRecord,
  submitConditionRecord,
  updateMentalValue,
  validateConditionDraft,
  type ConditionAlert,
  type ConditionDraft,
  type ConditionGraphData,
  type ConditionHistoryRecord,
  type ConditionRecordStore,
} from '../condition.js';
import {
  CONDITION_INVALID_VALUE_ERROR_NAME,
  createInMemoryConditionStore,
  expectConditionDraftValues,
  postCondition,
  TRAINEE_USER_ID,
  TRAINER_USER_ID,
  U_C06_INPUT_DRAFT,
} from './conditionTestFixtures.js';
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
      findHistoryByTraineeId: vi.fn().mockResolvedValue(historyWithLowMental),
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

/**
 * U-C05: コンディション入力値のドメイン層バリデーション
 * 前提条件: 新卒ユーザーとしてログイン中
 * アクション: 業務量・理解度・メンタルのいずれかに 1〜5 以外の値を含めて POST /api/condition を実行する
 * 期待結果: ドメイン層のバリデーションで拒否され、API が 400 を返すこと
 */
describe('U-C05 コンディション入力値のドメイン層バリデーション', () => {
  const traineeUserId = 'trainee-1';

  const validDraft: ConditionDraft = {
    workload: 3,
    comprehension: 3,
    mental: 3,
  };

  let conditionRecordStore: ConditionRecordStore;

  beforeEach(() => {
    conditionRecordStore = {
      save: vi.fn().mockResolvedValue(undefined),
      findHistoryByTraineeId: vi.fn().mockResolvedValue([]),
    };
  });

  it.each([
    {
      label: '業務量0',
      draft: { workload: 0, comprehension: 3, mental: 3 },
    },
    {
      label: '業務量6',
      draft: { workload: 6, comprehension: 3, mental: 3 },
    },
    {
      label: '理解度0',
      draft: { workload: 3, comprehension: 0, mental: 3 },
    },
    {
      label: '理解度6',
      draft: { workload: 3, comprehension: 6, mental: 3 },
    },
    {
      label: 'メンタル0',
      draft: { workload: 3, comprehension: 3, mental: 0 },
    },
    {
      label: 'メンタル6',
      draft: { workload: 3, comprehension: 3, mental: 6 },
    },
  ] as const)(
    'validateConditionDraft_$label_ドメイン層で拒否される',
    ({ draft }) => {
      expect(() => validateConditionDraft(draft)).toThrow(
        expect.objectContaining({ name: CONDITION_INVALID_VALUE_ERROR_NAME }),
      );
    },
  );

  it('submitConditionRecord_業務量0_保存されずドメイン層エラーが投げられる', async () => {
    const invalidDraft: ConditionDraft = {
      workload: 0,
      comprehension: 3,
      mental: 3,
    };

    await expect(
      submitConditionRecord(
        invalidDraft,
        traineeUserId,
        'trainee',
        conditionRecordStore,
      ),
    ).rejects.toMatchObject({ name: CONDITION_INVALID_VALUE_ERROR_NAME });

    expect(conditionRecordStore.save).not.toHaveBeenCalled();
  });

  it.each([
    { label: '業務量0', body: { workload: 0, comprehension: 3, mental: 3 } },
    { label: '業務量6', body: { workload: 6, comprehension: 3, mental: 3 } },
    {
      label: '業務量が文字列',
      body: { workload: '3', comprehension: 3, mental: 3 },
    },
    {
      label: '理解度が文字列',
      body: { workload: 3, comprehension: '3', mental: 3 },
    },
    {
      label: 'メンタルが文字列',
      body: { workload: 3, comprehension: 3, mental: '3' },
    },
  ] as const)('postCondition_$label_APIが400を返す', ({ body }) => {
    const response = postCondition(body, conditionRecordStore);

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({ error: 'Invalid condition input' });
    expect(conditionRecordStore.save).not.toHaveBeenCalled();
  });

  it('validateConditionDraft_全項目が1から5_エラーを投げない', () => {
    expect(() => validateConditionDraft(validDraft)).not.toThrow();
  });
});

/**
 * U-C06: 新卒入力ステートの保存
 * 前提条件: 新卒ユーザーとしてログイン中
 * アクション: 業務量・理解度・メンタルを入力して送信する
 * 期待結果: 送信した値が保存され、再取得時（最新記録取得 API 等）に同じ業務量・理解度・メンタルが取得できること
 *
 * 結合境界: submitConditionRecord → ConditionRecordStore → getLatestConditionRecord
 */
describe('U-C06 新卒入力ステートの保存', () => {
  let conditionRecordStore: ReturnType<typeof createInMemoryConditionStore>;

  beforeEach(() => {
    conditionRecordStore = createInMemoryConditionStore();
  });

  it('submitConditionRecord後getLatestConditionRecord_送信した業務量理解度メンタルが再取得できる', async () => {
    await submitConditionRecord(
      U_C06_INPUT_DRAFT,
      TRAINEE_USER_ID,
      'trainee',
      conditionRecordStore,
    );

    const latestRecord = await getLatestConditionRecord(
      TRAINEE_USER_ID,
      TRAINER_USER_ID,
      'trainer',
      conditionRecordStore,
    );

    expectConditionDraftValues(latestRecord, U_C06_INPUT_DRAFT);
  });

  it('submitConditionRecordを2回実行_getLatestConditionRecordは最新送信値を返す', async () => {
    const firstDraft: ConditionDraft = {
      workload: 1,
      comprehension: 2,
      mental: 3,
    };
    const secondDraft: ConditionDraft = U_C06_INPUT_DRAFT;

    await submitConditionRecord(
      firstDraft,
      TRAINEE_USER_ID,
      'trainee',
      conditionRecordStore,
    );
    await submitConditionRecord(
      secondDraft,
      TRAINEE_USER_ID,
      'trainee',
      conditionRecordStore,
    );

    const latestRecord = await getLatestConditionRecord(
      TRAINEE_USER_ID,
      TRAINER_USER_ID,
      'trainer',
      conditionRecordStore,
    );

    expectConditionDraftValues(latestRecord, secondDraft);
  });
});
