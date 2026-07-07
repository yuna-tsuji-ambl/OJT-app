import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  buildConditionAlert,
  buildConditionPageAlert,
  buildConditionLineChartData,
  createConditionDraft,
  buildConditionGraphTableRows,
  CONDITION_ALERT_MESSAGE,
  CONDITION_PAGE_ALERT_MESSAGE,
  CONDITION_VALUE_MAX,
  CONDITION_VALUE_MIN,
  getConditionAlert,
  getConditionGraphData,
  getConditionPageAlert,
  getLatestConditionRecord,
  listConditionAlerts,
  submitConditionRecord,
  updateMentalValue,
  validateConditionDraft,
  type ConditionAlert,
  type ConditionDraft,
  type ConditionGraphData,
  type ConditionHistoryRecord,
  type ConditionLineChartData,
  type ConditionPageAlert,
  type ConditionRecordStore,
} from '../condition.js';
import {
  CONDITION_INVALID_VALUE_ERROR_NAME,
  createInMemoryConditionStore,
  expectConditionDraftValues,
  getConditionAlerts,
  getConditionGraph,
  getConditionPageAlert as getConditionPageAlertRoute,
  postCondition,
  TRAINEE_USER_ID,
  TRAINER_USER_ID,
  U_C03_EXPECTED_LINE_CHART,
  U_C03_EXPECTED_TABLE_ROWS,
  U_C03_HISTORY_RECORDS,
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
 * U-C03: コンディション推移の表表示
 * 前提条件: OJTトレーナーとしてログイン中
 * アクション: 対象新卒のコンディション画面を開く
 * 期待結果: 過去の入力データに基づき、記録日時・業務量・理解度・メンタルを行とする推移表が正しく表示されること
 *
 * 結合境界:
 * - 単体: buildConditionGraphTableRows（履歴 → 表行）
 * - 結合: getConditionGraphData → ConditionRecordStore
 * - API: GET /api/condition/trainees/:traineeId/graph
 */
describe('U-C03 コンディション推移の表表示', () => {
  const trainerUserId = TRAINER_USER_ID;
  const traineeUserId = TRAINEE_USER_ID;

  it('buildConditionGraphTableRows_過去3件の履歴_記録日時と3項目を行として返す', () => {
    const rows = buildConditionGraphTableRows(U_C03_HISTORY_RECORDS);

    expect(rows).toEqual(U_C03_EXPECTED_TABLE_ROWS);
  });

  it('getConditionGraphData_トレーナーが対象新卒の履歴取得_推移表rowsが返る', async () => {
    const conditionRecordStore: ConditionRecordStore = {
      save: vi.fn().mockResolvedValue(undefined),
      findHistoryByTraineeId: vi.fn().mockResolvedValue(U_C03_HISTORY_RECORDS),
    };

    const graphData = await getConditionGraphData(
      traineeUserId,
      trainerUserId,
      'trainer',
      conditionRecordStore,
    );

    expect(conditionRecordStore.findHistoryByTraineeId).toHaveBeenCalledWith(
      traineeUserId,
    );
    expect(graphData.rows).toEqual(U_C03_EXPECTED_TABLE_ROWS);
  });

  it('getConditionGraphData_InMemoryストア_推移表rowsが履歴順で返る', async () => {
    const conditionRecordStore = createInMemoryConditionStore();
    const firstDraft: ConditionDraft = {
      workload: 1,
      comprehension: 2,
      mental: 3,
    };
    const secondDraft: ConditionDraft = {
      workload: 4,
      comprehension: 3,
      mental: 2,
    };

    await submitConditionRecord(
      firstDraft,
      traineeUserId,
      'trainee',
      conditionRecordStore,
    );
    await submitConditionRecord(
      secondDraft,
      traineeUserId,
      'trainee',
      conditionRecordStore,
    );

    const graphData = await getConditionGraphData(
      traineeUserId,
      trainerUserId,
      'trainer',
      conditionRecordStore,
    );

    expect(graphData.rows).toHaveLength(2);
    expect(graphData.rows[0]).toMatchObject(firstDraft);
    expect(graphData.rows[1]).toMatchObject(secondDraft);
    for (const row of graphData.rows) {
      expect(row.recordedAt).toEqual(expect.any(String));
      expect(row.recordedAt.length).toBeGreaterThan(0);
    }
  });

  it('getConditionGraph_トレーナーGET_推移表rowsが200で返る', async () => {
    const conditionRecordStore = createInMemoryConditionStore();
    const firstDraft: ConditionDraft = {
      workload: 1,
      comprehension: 2,
      mental: 3,
    };
    const secondDraft: ConditionDraft = {
      workload: 4,
      comprehension: 3,
      mental: 2,
    };

    await submitConditionRecord(
      firstDraft,
      traineeUserId,
      'trainee',
      conditionRecordStore,
    );
    await submitConditionRecord(
      secondDraft,
      traineeUserId,
      'trainee',
      conditionRecordStore,
    );

    const response = await getConditionGraph(
      traineeUserId,
      conditionRecordStore,
    );

    expect(response.statusCode).toBe(200);
    const body = response.body as { rows: ConditionHistoryRecord[] };
    expect(body.rows).toHaveLength(2);
    expect(body.rows[0]).toMatchObject(firstDraft);
    expect(body.rows[1]).toMatchObject(secondDraft);
  });
});

/**
 * U-C03: コンディション推移の折れ線グラフ表示
 * 前提条件: OJTトレーナーとしてログイン中
 * アクション: 対象新卒のコンディション画面を開く
 * 期待結果: 過去の入力データに基づき、記録日時を横軸・業務量・理解度・メンタルを 3 系列とする折れ線グラフが正しく表示されること
 *
 * 結合境界:
 * - 単体: buildConditionLineChartData（履歴 → 折れ線グラフ用データ）
 * - 結合: getConditionGraphData → ConditionRecordStore
 * - API: GET /api/condition/trainees/:traineeId/graph
 */
describe('U-C03 コンディション推移の折れ線グラフ表示', () => {
  const trainerUserId = TRAINER_USER_ID;
  const traineeUserId = TRAINEE_USER_ID;

  function expectLineChartValueScale(lineChart: ConditionLineChartData): void {
    expect(lineChart.yAxisMin).toBe(CONDITION_VALUE_MIN);
    expect(lineChart.yAxisMax).toBe(CONDITION_VALUE_MAX);

    const pointCount = lineChart.xAxisLabels.length;
    expect(lineChart.series).toHaveLength(3);

    for (const series of lineChart.series) {
      expect(series.values).toHaveLength(pointCount);
      for (const value of series.values) {
        expect(value).toBeGreaterThanOrEqual(CONDITION_VALUE_MIN);
        expect(value).toBeLessThanOrEqual(CONDITION_VALUE_MAX);
      }
    }
  }

  it('buildConditionLineChartData_過去3件の履歴_横軸と3系列の折れ線グラフデータを返す', () => {
    const lineChart = buildConditionLineChartData(U_C03_HISTORY_RECORDS);

    expect(lineChart).toEqual(U_C03_EXPECTED_LINE_CHART);
    expectLineChartValueScale(lineChart);
  });

  it('buildConditionLineChartData_履歴なし_空の折れ線グラフデータを返す', () => {
    const lineChart = buildConditionLineChartData([]);

    expect(lineChart).toEqual({
      xAxisLabels: [],
      yAxisMin: CONDITION_VALUE_MIN,
      yAxisMax: CONDITION_VALUE_MAX,
      series: [
        { key: 'workload', label: '業務量', values: [] },
        { key: 'comprehension', label: '理解度', values: [] },
        { key: 'mental', label: 'メンタル', values: [] },
      ],
    });
  });

  it('getConditionGraphData_トレーナーが対象新卒の履歴取得_折れ線グラフデータが返る', async () => {
    const conditionRecordStore: ConditionRecordStore = {
      save: vi.fn().mockResolvedValue(undefined),
      findHistoryByTraineeId: vi.fn().mockResolvedValue(U_C03_HISTORY_RECORDS),
    };

    const graphData = await getConditionGraphData(
      traineeUserId,
      trainerUserId,
      'trainer',
      conditionRecordStore,
    );

    expect(conditionRecordStore.findHistoryByTraineeId).toHaveBeenCalledWith(
      traineeUserId,
    );
    expect(graphData.lineChart).toEqual(U_C03_EXPECTED_LINE_CHART);
    expectLineChartValueScale(graphData.lineChart);
  });

  it('getConditionGraphData_InMemoryストア_折れ線グラフ系列が履歴順で返る', async () => {
    const conditionRecordStore = createInMemoryConditionStore();
    const firstDraft: ConditionDraft = {
      workload: 1,
      comprehension: 2,
      mental: 3,
    };
    const secondDraft: ConditionDraft = {
      workload: 4,
      comprehension: 3,
      mental: 2,
    };

    await submitConditionRecord(
      firstDraft,
      traineeUserId,
      'trainee',
      conditionRecordStore,
    );
    await submitConditionRecord(
      secondDraft,
      traineeUserId,
      'trainee',
      conditionRecordStore,
    );

    const graphData = await getConditionGraphData(
      traineeUserId,
      trainerUserId,
      'trainer',
      conditionRecordStore,
    );

    expect(graphData.lineChart.xAxisLabels).toHaveLength(2);
    expect(graphData.lineChart.series[0].values).toEqual([
      firstDraft.workload,
      secondDraft.workload,
    ]);
    expect(graphData.lineChart.series[1].values).toEqual([
      firstDraft.comprehension,
      secondDraft.comprehension,
    ]);
    expect(graphData.lineChart.series[2].values).toEqual([
      firstDraft.mental,
      secondDraft.mental,
    ]);
    expectLineChartValueScale(graphData.lineChart);
  });

  it('getConditionGraph_トレーナーGET_折れ線グラフデータが200で返る', async () => {
    const conditionRecordStore = createInMemoryConditionStore();
    const firstDraft: ConditionDraft = {
      workload: 1,
      comprehension: 2,
      mental: 3,
    };
    const secondDraft: ConditionDraft = {
      workload: 4,
      comprehension: 3,
      mental: 2,
    };

    await submitConditionRecord(
      firstDraft,
      traineeUserId,
      'trainee',
      conditionRecordStore,
    );
    await submitConditionRecord(
      secondDraft,
      traineeUserId,
      'trainee',
      conditionRecordStore,
    );

    const response = await getConditionGraph(
      traineeUserId,
      conditionRecordStore,
    );

    expect(response.statusCode).toBe(200);
    const body = response.body as ConditionGraphData;
    expect(body.lineChart.xAxisLabels).toHaveLength(2);
    expect(body.lineChart.series[0].values).toEqual([
      firstDraft.workload,
      secondDraft.workload,
    ]);
    expect(body.lineChart.series[1].values).toEqual([
      firstDraft.comprehension,
      secondDraft.comprehension,
    ]);
    expect(body.lineChart.series[2].values).toEqual([
      firstDraft.mental,
      secondDraft.mental,
    ]);
    expectLineChartValueScale(body.lineChart);
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
 * U-C04: アラートの検知と表示（ダッシュボード）
 * 前提条件: OJTトレーナーとしてログイン中
 * アクション: 新卒の直近の「業務量・理解度・メンタル」値の少なくとも１つが「1」の状態でダッシュボードを開く
 * 期待結果: 対象新卒のパネルに目立つ「SOSアラート（例: 要フォロー）」が表示されること
 *
 * 結合境界:
 * - 単体: buildConditionAlert（直近記録のいずれかが 1 → アラート）
 * - 結合: getConditionAlert / listConditionAlerts → ConditionRecordStore
 * - API: GET /api/condition/alerts
 */
describe('U-C04 アラートの検知と表示（ダッシュボード）', () => {
  const trainerUserId = TRAINER_USER_ID;
  const traineeUserId = TRAINEE_USER_ID;

  it.each([
    {
      label: '業務量1',
      latest: { workload: 1, comprehension: 3, mental: 3 },
    },
    {
      label: '理解度1',
      latest: { workload: 3, comprehension: 1, mental: 3 },
    },
    {
      label: 'メンタル1',
      latest: { workload: 3, comprehension: 3, mental: 1 },
    },
  ] as const)(
    'buildConditionAlert_$label_hasAlertがtrueで要フォローが返る',
    ({ latest }) => {
      const records: ConditionHistoryRecord[] = [
        {
          recordedAt: '2026-03-01',
          workload: 3,
          comprehension: 3,
          mental: 3,
        },
        {
          recordedAt: '2026-03-15',
          ...latest,
        },
      ];

      const alert = buildConditionAlert(traineeUserId, records);

      expect(alert.traineeId).toBe(traineeUserId);
      expect(alert.hasAlert).toBe(true);
      expect(alert.message).toBe(CONDITION_ALERT_MESSAGE);
    },
  );

  it('buildConditionAlert_直近3項目すべて1以外_hasAlertがfalse', () => {
    const records: ConditionHistoryRecord[] = [
      {
        recordedAt: '2026-03-15',
        workload: 2,
        comprehension: 3,
        mental: 4,
      },
    ];

    const alert = buildConditionAlert(traineeUserId, records);

    expect(alert.hasAlert).toBe(false);
    expect(alert.message).toBe('');
  });

  it('getConditionAlert_直近業務量1_SOSアラートが返る', async () => {
    const historyWithLowWorkload: ConditionHistoryRecord[] = [
      {
        recordedAt: '2026-03-15',
        workload: 1,
        comprehension: 4,
        mental: 5,
      },
    ];
    const conditionRecordStore: ConditionRecordStore = {
      save: vi.fn().mockResolvedValue(undefined),
      findHistoryByTraineeId: vi.fn().mockResolvedValue(historyWithLowWorkload),
    };

    const alert = await getConditionAlert(
      traineeUserId,
      trainerUserId,
      'trainer',
      conditionRecordStore,
    );

    expect(alert.hasAlert).toBe(true);
    expect(alert.message).toBe(CONDITION_ALERT_MESSAGE);
  });

  it('listConditionAlerts_直近理解度1_監視対象新卒にSOSアラートが含まれる', async () => {
    const conditionRecordStore = createInMemoryConditionStore();

    await submitConditionRecord(
      { workload: 4, comprehension: 1, mental: 3 },
      traineeUserId,
      'trainee',
      conditionRecordStore,
    );

    const alerts = await listConditionAlerts(
      trainerUserId,
      'trainer',
      conditionRecordStore,
    );

    const traineeAlert = alerts.find(
      (alert) => alert.traineeId === traineeUserId,
    );

    expect(traineeAlert?.hasAlert).toBe(true);
    expect(traineeAlert?.message).toBe(CONDITION_ALERT_MESSAGE);
  });

  it('getConditionAlerts_直近メンタル1_200で要フォローアラートが返る', async () => {
    const conditionRecordStore = createInMemoryConditionStore();

    await submitConditionRecord(
      { workload: 3, comprehension: 3, mental: 1 },
      traineeUserId,
      'trainee',
      conditionRecordStore,
    );

    const response = await getConditionAlerts(conditionRecordStore);

    expect(response.statusCode).toBe(200);
    const alerts = response.body as ConditionAlert[];
    const traineeAlert = alerts.find(
      (alert) => alert.traineeId === traineeUserId,
    );

    expect(traineeAlert?.hasAlert).toBe(true);
    expect(traineeAlert?.message).toBe(CONDITION_ALERT_MESSAGE);
  });
});

/**
 * U-C07: コンディション画面でのメンタル不安定アラート
 * 前提条件: OJTトレーナーとしてログイン中
 * アクション: 対象新卒の直近の「業務量・理解度・メンタル」値の少なくとも１つが「1」の状態でコンディション画面を開く
 * 期待結果: 画面上にアラート「新卒が不安定です。」が表示されること
 *
 * 結合境界:
 * - 単体: buildConditionPageAlert（直近記録のいずれかが 1 → コンディション画面アラート）
 * - 結合: getConditionPageAlert → ConditionRecordStore
 * - API: GET /api/condition/trainees/:traineeId/page-alert
 */
describe('U-C07 コンディション画面でのメンタル不安定アラート', () => {
  const trainerUserId = TRAINER_USER_ID;
  const traineeUserId = TRAINEE_USER_ID;

  it.each([
    {
      label: '業務量1',
      latest: { workload: 1, comprehension: 3, mental: 3 },
    },
    {
      label: '理解度1',
      latest: { workload: 3, comprehension: 1, mental: 3 },
    },
    {
      label: 'メンタル1',
      latest: { workload: 3, comprehension: 3, mental: 1 },
    },
  ] as const)(
    'buildConditionPageAlert_$label_不安定アラートが返る',
    ({ latest }) => {
      const records: ConditionHistoryRecord[] = [
        {
          recordedAt: '2026-03-01',
          workload: 3,
          comprehension: 3,
          mental: 3,
        },
        {
          recordedAt: '2026-03-15',
          ...latest,
        },
      ];

      const pageAlert: ConditionPageAlert = buildConditionPageAlert(records);

      expect(pageAlert.hasAlert).toBe(true);
      expect(pageAlert.message).toBe(CONDITION_PAGE_ALERT_MESSAGE);
    },
  );

  it('buildConditionPageAlert_直近3項目すべて1以外_アラートなし', () => {
    const records: ConditionHistoryRecord[] = [
      {
        recordedAt: '2026-03-15',
        workload: 2,
        comprehension: 3,
        mental: 4,
      },
    ];

    const pageAlert = buildConditionPageAlert(records);

    expect(pageAlert.hasAlert).toBe(false);
    expect(pageAlert.message).toBe('');
  });

  it('getConditionPageAlert_直近メンタル1_不安定アラートが返る', async () => {
    const historyWithLowMental: ConditionHistoryRecord[] = [
      {
        recordedAt: '2026-03-15',
        workload: 4,
        comprehension: 2,
        mental: 1,
      },
    ];
    const conditionRecordStore: ConditionRecordStore = {
      save: vi.fn().mockResolvedValue(undefined),
      findHistoryByTraineeId: vi.fn().mockResolvedValue(historyWithLowMental),
    };

    const pageAlert = await getConditionPageAlert(
      traineeUserId,
      trainerUserId,
      'trainer',
      conditionRecordStore,
    );

    expect(conditionRecordStore.findHistoryByTraineeId).toHaveBeenCalledWith(
      traineeUserId,
    );
    expect(pageAlert.hasAlert).toBe(true);
    expect(pageAlert.message).toBe(CONDITION_PAGE_ALERT_MESSAGE);
  });

  it('getConditionPageAlert_InMemoryストア_直近業務量1_不安定アラートが返る', async () => {
    const conditionRecordStore = createInMemoryConditionStore();

    await submitConditionRecord(
      { workload: 1, comprehension: 4, mental: 5 },
      traineeUserId,
      'trainee',
      conditionRecordStore,
    );

    const pageAlert = await getConditionPageAlert(
      traineeUserId,
      trainerUserId,
      'trainer',
      conditionRecordStore,
    );

    expect(pageAlert.hasAlert).toBe(true);
    expect(pageAlert.message).toBe(CONDITION_PAGE_ALERT_MESSAGE);
  });

  it('getConditionPageAlert_トレーナーGET_200で不安定アラートが返る', async () => {
    const conditionRecordStore = createInMemoryConditionStore();

    await submitConditionRecord(
      { workload: 3, comprehension: 1, mental: 3 },
      traineeUserId,
      'trainee',
      conditionRecordStore,
    );

    const response = await getConditionPageAlertRoute(
      traineeUserId,
      conditionRecordStore,
    );

    expect(response.statusCode).toBe(200);
    const pageAlert = response.body as ConditionPageAlert;
    expect(pageAlert.hasAlert).toBe(true);
    expect(pageAlert.message).toBe(CONDITION_PAGE_ALERT_MESSAGE);
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
  ] as const)('postCondition_$label_APIが400を返す', async ({ body }) => {
    const response = await postCondition(body, conditionRecordStore);

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
