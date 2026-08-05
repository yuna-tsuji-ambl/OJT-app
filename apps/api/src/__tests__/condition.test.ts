import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  buildConditionLineChartPlotXCoordinates,
  buildConditionLineChartScrollContentDisplaySize,
  buildConditionLineChartXAxisAlignment,
  buildConditionLineChartXAxisBaselineY,
  buildConditionLineChartXAxisTicksFromAlignment,
  buildConditionTransitionTableCellBorderLayout,
  buildConditionTransitionTableMatrixLayout,
  CONDITION_LINE_CHART_DISPLAY_SIZE,
  resolveConditionLineChartPlotDisplaySize,
} from '@ojt-app/shared';
import {
  buildConditionAlert,
  buildConditionPageAlert,
  buildConditionLineChartData,
  createConditionDraft,
  buildConditionGraphTableRows,
  buildConditionTransitionTable,
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
  type ConditionTransitionTableData,
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
  U_C12_EXPECTED_X_AXIS_ALIGNMENT_EMPTY,
  U_C06_INPUT_DRAFT,
  U_C08_EXPECTED_SUPPLEMENTAL_DISPLAY,
  U_C08_EXPECTED_X_AXIS_TICKS,
  U_C08_EXPECTED_Y_AXIS_TICKS,
  U_C08_HISTORY_RECORDS,
  U_C08_Y_AXIS_TICK_VALUES,
  U_C09_EXPECTED_TRANSITION_TABLE,
  U_C09_FIRST_INPUT,
  U_C09_HISTORY_RECORDS,
  U_C09_SECOND_INPUT,
  U_C09_TRANSITION_TABLE_COLUMNS,
  U_C10_EXPECTED_LINE_CHART_DISPLAY_SIZE,
  U_C10_HISTORY_RECORDS,
  U_C10_LEGACY_LINE_CHART_DISPLAY_SIZE,
  U_C11_EXPECTED_HORIZONTAL_SCROLL_DISABLED,
  U_C11_EXPECTED_HORIZONTAL_SCROLL_EMPTY,
  U_C11_EXPECTED_HORIZONTAL_SCROLL_ENABLED,
  U_C11_NON_SCROLLABLE_HISTORY_RECORDS,
  U_C11_SCROLLABLE_HISTORY_RECORDS,
  U_C13_EXPECTED_MATRIX_LAYOUT_EMPTY,
} from './conditionTestFixtures.js';

interface ConditionLineChartDisplaySize {
  width: number;
  height: number;
  plotWidth: number;
  plotHeight: number;
  paddingLeft: number;
  paddingRight: number;
  paddingTop: number;
  paddingBottom: number;
}

type ConditionLineChartDataWithDisplaySize = ConditionLineChartData & {
  displaySize: ConditionLineChartDisplaySize;
};

interface ConditionLineChartHorizontalScroll {
  enabled: boolean;
  viewportWidth: number;
  contentWidth: number;
  fixedYAxis: boolean;
}

type ConditionLineChartDataWithHorizontalScroll = ConditionLineChartData & {
  horizontalScroll: ConditionLineChartHorizontalScroll;
};

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
      yAxisTicks: U_C08_EXPECTED_Y_AXIS_TICKS,
      xAxisTicks: [],
      supplementalDisplay: U_C08_EXPECTED_SUPPLEMENTAL_DISPLAY,
      displaySize: U_C10_EXPECTED_LINE_CHART_DISPLAY_SIZE,
      horizontalScroll: U_C11_EXPECTED_HORIZONTAL_SCROLL_EMPTY,
      xAxisAlignment: U_C12_EXPECTED_X_AXIS_ALIGNMENT_EMPTY,
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

/**
 * U-C08: 折れ線グラフの軸・目盛表示
 * 前提条件: OJTトレーナーとしてログイン中、対象新卒のコンディションが複数回記録されている
 * アクション: 対象新卒のコンディション画面を開く
 * 期待結果: 縦軸目盛 1〜5 と横軸の記録日付、対応する縦横の補助線（グリッド）が含まれること。
 *           補助テキスト（1〜5 のテキスト、日付の箇条書き、系列ごとの数値リスト）を表示しない契約であること
 *
 * 結合境界:
 * - 単体: buildConditionLineChartData（履歴 → 軸・目盛・グリッド用メタデータ）
 * - 結合: getConditionGraphData → ConditionRecordStore
 * - API: GET /api/condition/trainees/:traineeId/graph
 */
describe('U-C08 折れ線グラフの軸・目盛表示', () => {
  const trainerUserId = TRAINER_USER_ID;
  const traineeUserId = TRAINEE_USER_ID;

  function expectLineChartAxisAndGrid(lineChart: ConditionLineChartData): void {
    expect(lineChart.yAxisTicks).toEqual(U_C08_EXPECTED_Y_AXIS_TICKS);
    expect(lineChart.yAxisTicks.map((tick) => tick.value)).toEqual([
      ...U_C08_Y_AXIS_TICK_VALUES,
    ]);
    expect(lineChart.yAxisTicks.every((tick) => tick.showGridLine)).toBe(true);

    expect(lineChart.xAxisTicks).toEqual(
      lineChart.xAxisAlignment.positions.map((position) => ({
        label: position.label,
        showGridLine: true,
        x: position.x,
        y: position.y,
      })),
    );
    expect(lineChart.xAxisTicks.every((tick) => tick.showGridLine)).toBe(true);
  }

  function expectLineChartSupplementalDisplayHidden(
    lineChart: ConditionLineChartData,
  ): void {
    expect(lineChart.supplementalDisplay).toEqual(
      U_C08_EXPECTED_SUPPLEMENTAL_DISPLAY,
    );
    expect(lineChart.supplementalDisplay.showYAxisRangeText).toBe(false);
    expect(lineChart.supplementalDisplay.showDateList).toBe(false);
    expect(lineChart.supplementalDisplay.showSeriesValueLists).toBe(false);
  }

  it('buildConditionLineChartData_複数回記録_縦軸1から5と横軸日付の目盛とグリッドを返す', () => {
    const lineChart = buildConditionLineChartData(U_C08_HISTORY_RECORDS);

    expect(lineChart.xAxisLabels).toEqual(
      U_C08_HISTORY_RECORDS.map((record) => record.recordedAt),
    );
    expect(lineChart.xAxisTicks).toEqual(U_C08_EXPECTED_X_AXIS_TICKS);
    expectLineChartAxisAndGrid(lineChart);
  });

  it('buildConditionLineChartData_複数回記録_補助テキスト表示フラグがすべてfalse', () => {
    const lineChart = buildConditionLineChartData(U_C08_HISTORY_RECORDS);

    expectLineChartSupplementalDisplayHidden(lineChart);
  });

  it('buildConditionLineChartData_履歴なし_縦軸1から5の目盛と空の横軸目盛を返す', () => {
    const lineChart = buildConditionLineChartData([]);

    expect(lineChart.yAxisTicks).toEqual(U_C08_EXPECTED_Y_AXIS_TICKS);
    expect(lineChart.xAxisTicks).toEqual([]);
    expectLineChartSupplementalDisplayHidden(lineChart);
  });

  it('getConditionGraphData_複数回記録_lineChartに軸目盛とグリッドが返る', async () => {
    const conditionRecordStore: ConditionRecordStore = {
      save: vi.fn().mockResolvedValue(undefined),
      findHistoryByTraineeId: vi.fn().mockResolvedValue(U_C08_HISTORY_RECORDS),
    };

    const graphData = await getConditionGraphData(
      traineeUserId,
      trainerUserId,
      'trainer',
      conditionRecordStore,
    );

    const lineChart = graphData.lineChart;

    expect(conditionRecordStore.findHistoryByTraineeId).toHaveBeenCalledWith(
      traineeUserId,
    );
    expectLineChartAxisAndGrid(lineChart);
    expectLineChartSupplementalDisplayHidden(lineChart);
  });

  it('getConditionGraphData_InMemoryストア_2回記録後_横軸が記録日付2件でグリッド付き', async () => {
    const conditionRecordStore = createInMemoryConditionStore();
    const firstDraft: ConditionDraft = {
      workload: 3,
      comprehension: 3,
      mental: 3,
    };
    const secondDraft: ConditionDraft = {
      workload: 3,
      comprehension: 3,
      mental: 1,
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

    const lineChart = graphData.lineChart;

    expect(lineChart.xAxisLabels).toHaveLength(2);
    expect(lineChart.xAxisTicks).toHaveLength(2);
    expect(lineChart.xAxisTicks.every((tick) => tick.showGridLine)).toBe(true);
    expectLineChartAxisAndGrid(lineChart);
    expectLineChartSupplementalDisplayHidden(lineChart);
  });

  it('getConditionGraph_トレーナーGET_lineChartに軸目盛とグリッドが200で返る', async () => {
    const conditionRecordStore = createInMemoryConditionStore();

    await submitConditionRecord(
      { workload: 3, comprehension: 3, mental: 3 },
      traineeUserId,
      'trainee',
      conditionRecordStore,
    );
    await submitConditionRecord(
      { workload: 3, comprehension: 3, mental: 1 },
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
    const lineChart = body.lineChart;

    expect(lineChart.xAxisTicks).toHaveLength(2);
    expectLineChartAxisAndGrid(lineChart);
    expectLineChartSupplementalDisplayHidden(lineChart);
  });
});

/**
 * U-C09: コンディション推移表の表示
 * 前提条件: OJTトレーナーとしてログイン中、対象新卒のコンディションが複数回記録されている
 * アクション: 対象新卒のコンディション画面を開く
 * 期待結果: 折れ線グラフの下に記録日時・業務量・理解度・メンタルを列とする表データが含まれること。
 *           各行の値が履歴と一致し、同一日付の再入力は別行として保持されること
 *
 * 結合境界:
 * - 単体: buildConditionTransitionTable（表行 → 列定義 + 表行）
 * - 結合: getConditionGraphData → ConditionRecordStore
 * - API: GET /api/condition/trainees/:traineeId/graph
 */
describe('U-C09 コンディション推移表の表示', () => {
  const trainerUserId = TRAINER_USER_ID;
  const traineeUserId = TRAINEE_USER_ID;

  function expectTransitionTable(
    transitionTable: ConditionTransitionTableData,
  ): void {
    expect(transitionTable.columns).toEqual(U_C09_TRANSITION_TABLE_COLUMNS);
    expect(transitionTable.rows).toEqual(U_C09_EXPECTED_TRANSITION_TABLE.rows);
  }

  it('buildConditionTransitionTable_同一日付2件の履歴_列定義と2行を返す', () => {
    const transitionTable = buildConditionTransitionTable(
      buildConditionGraphTableRows(U_C09_HISTORY_RECORDS),
    );

    expectTransitionTable(transitionTable);
    expect(transitionTable.rows).toHaveLength(2);
    expect(transitionTable.rows[0]).toMatchObject({
      recordedAt: '2026-07-13',
      workload: 4,
      comprehension: 3,
      mental: 3,
    });
    expect(transitionTable.rows[1]).toMatchObject({
      recordedAt: '2026-07-13',
      workload: 4,
      comprehension: 3,
      mental: 1,
    });
  });

  it('buildConditionTransitionTable_履歴なし_列定義と空行を返す', () => {
    const transitionTable = buildConditionTransitionTable([]);

    expect(transitionTable.columns).toEqual(U_C09_TRANSITION_TABLE_COLUMNS);
    expect(transitionTable.rows).toEqual([]);
  });

  it('getConditionGraphData_複数回記録_transitionTableが返る', async () => {
    const conditionRecordStore: ConditionRecordStore = {
      save: vi.fn().mockResolvedValue(undefined),
      findHistoryByTraineeId: vi.fn().mockResolvedValue(U_C09_HISTORY_RECORDS),
    };

    const graphData = await getConditionGraphData(
      traineeUserId,
      trainerUserId,
      'trainer',
      conditionRecordStore,
    );

    const { transitionTable } = graphData;

    expect(conditionRecordStore.findHistoryByTraineeId).toHaveBeenCalledWith(
      traineeUserId,
    );
    expectTransitionTable(transitionTable);
  });

  it('getConditionGraphData_InMemoryストア_2回送信後_同一日付も別行で返る', async () => {
    const conditionRecordStore = createInMemoryConditionStore();

    await submitConditionRecord(
      U_C09_FIRST_INPUT,
      traineeUserId,
      'trainee',
      conditionRecordStore,
    );
    await submitConditionRecord(
      U_C09_SECOND_INPUT,
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

    const { transitionTable } = graphData;

    expect(transitionTable.rows).toHaveLength(2);
    expect(transitionTable.rows[0]).toMatchObject(U_C09_FIRST_INPUT);
    expect(transitionTable.rows[1]).toMatchObject(U_C09_SECOND_INPUT);
    expect(transitionTable.columns).toEqual(U_C09_TRANSITION_TABLE_COLUMNS);
  });

  it('getConditionGraph_トレーナーGET_transitionTableが200で返る', async () => {
    const conditionRecordStore = createInMemoryConditionStore();

    await submitConditionRecord(
      U_C09_FIRST_INPUT,
      traineeUserId,
      'trainee',
      conditionRecordStore,
    );
    await submitConditionRecord(
      U_C09_SECOND_INPUT,
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

    expect(body.transitionTable.rows).toHaveLength(2);
    expect(body.transitionTable.rows[0]).toMatchObject(U_C09_FIRST_INPUT);
    expect(body.transitionTable.rows[1]).toMatchObject(U_C09_SECOND_INPUT);
    expect(body.transitionTable.columns).toEqual(
      U_C09_TRANSITION_TABLE_COLUMNS,
    );
  });
});

/**
 * U-C10: 折れ線グラフの表示サイズ
 * 前提条件: OJTトレーナーとしてログイン中、対象新卒のコンディションが複数回記録されている
 * アクション: 対象新卒のコンディション画面を開く
 * 期待結果: 折れ線グラフの描画領域が、縦軸目盛・プロット領域・横軸日付を十分に表示できる大きさであること
 *           （現状より大きめの表示であること）
 *
 * 結合境界:
 * - 単体: buildConditionLineChartData（履歴 → 描画サイズメタデータ）
 * - 結合: getConditionGraphData → ConditionRecordStore
 * - API: GET /api/condition/trainees/:traineeId/graph
 */
describe('U-C10 折れ線グラフの表示サイズ', () => {
  const trainerUserId = TRAINER_USER_ID;
  const traineeUserId = TRAINEE_USER_ID;

  function asLineChartWithDisplaySize(
    lineChart: ConditionLineChartData,
  ): ConditionLineChartDataWithDisplaySize {
    return lineChart as ConditionLineChartDataWithDisplaySize;
  }

  function expectLineChartDisplaySize(
    lineChart: ConditionLineChartDataWithDisplaySize,
  ): void {
    expect(lineChart.displaySize).toEqual(
      U_C10_EXPECTED_LINE_CHART_DISPLAY_SIZE,
    );
    expect(lineChart.displaySize.width).toBeGreaterThan(
      U_C10_LEGACY_LINE_CHART_DISPLAY_SIZE.width,
    );
    expect(lineChart.displaySize.height).toBeGreaterThan(
      U_C10_LEGACY_LINE_CHART_DISPLAY_SIZE.height,
    );
    expect(lineChart.displaySize.plotWidth).toBeGreaterThan(
      U_C10_LEGACY_LINE_CHART_DISPLAY_SIZE.plotWidth,
    );
    expect(lineChart.displaySize.plotHeight).toBeGreaterThan(
      U_C10_LEGACY_LINE_CHART_DISPLAY_SIZE.plotHeight,
    );
    expect(lineChart.displaySize.plotWidth).toBe(
      lineChart.displaySize.width -
        lineChart.displaySize.paddingLeft -
        lineChart.displaySize.paddingRight,
    );
    expect(lineChart.displaySize.plotHeight).toBe(
      lineChart.displaySize.height -
        lineChart.displaySize.paddingTop -
        lineChart.displaySize.paddingBottom,
    );
    expect(lineChart.displaySize.paddingLeft).toBeGreaterThanOrEqual(
      U_C10_LEGACY_LINE_CHART_DISPLAY_SIZE.paddingLeft,
    );
    expect(lineChart.displaySize.paddingBottom).toBeGreaterThanOrEqual(
      U_C10_LEGACY_LINE_CHART_DISPLAY_SIZE.paddingBottom,
    );
  }

  it('buildConditionLineChartData_複数回記録_大きめの描画サイズを返す', () => {
    const lineChart = asLineChartWithDisplaySize(
      buildConditionLineChartData(U_C10_HISTORY_RECORDS),
    );

    expectLineChartDisplaySize(lineChart);
  });

  it('buildConditionLineChartData_履歴なし_描画サイズ契約を返す', () => {
    const lineChart = asLineChartWithDisplaySize(
      buildConditionLineChartData([]),
    );

    expectLineChartDisplaySize(lineChart);
  });

  it('getConditionGraphData_複数回記録_lineChartに描画サイズが返る', async () => {
    const conditionRecordStore: ConditionRecordStore = {
      save: vi.fn().mockResolvedValue(undefined),
      findHistoryByTraineeId: vi.fn().mockResolvedValue(U_C10_HISTORY_RECORDS),
    };

    const graphData = await getConditionGraphData(
      traineeUserId,
      trainerUserId,
      'trainer',
      conditionRecordStore,
    );

    const lineChart = asLineChartWithDisplaySize(graphData.lineChart);

    expect(conditionRecordStore.findHistoryByTraineeId).toHaveBeenCalledWith(
      traineeUserId,
    );
    expectLineChartDisplaySize(lineChart);
  });

  it('getConditionGraphData_InMemoryストア_2回記録後_描画サイズが返る', async () => {
    const conditionRecordStore = createInMemoryConditionStore();

    await submitConditionRecord(
      { workload: 3, comprehension: 3, mental: 3 },
      traineeUserId,
      'trainee',
      conditionRecordStore,
    );
    await submitConditionRecord(
      { workload: 3, comprehension: 3, mental: 1 },
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

    expectLineChartDisplaySize(asLineChartWithDisplaySize(graphData.lineChart));
  });

  it('getConditionGraph_トレーナーGET_lineChartに描画サイズが200で返る', async () => {
    const conditionRecordStore = createInMemoryConditionStore();

    await submitConditionRecord(
      { workload: 3, comprehension: 3, mental: 3 },
      traineeUserId,
      'trainee',
      conditionRecordStore,
    );
    await submitConditionRecord(
      { workload: 3, comprehension: 3, mental: 1 },
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

    expectLineChartDisplaySize(asLineChartWithDisplaySize(body.lineChart));
  });
});

/**
 * U-C11: 折れ線グラフの横スクロール
 * 前提条件: OJTトレーナーとしてログイン中、対象新卒のコンディションが画面幅を超える件数まで記録されている
 * アクション: 対象新卒のコンディション画面を開く
 * 期待結果: 折れ線グラフ内を横方向にスクロールすると、画面外の記録日時・データ点・縦方向グリッド線が閲覧できる契約であること
 *           縦軸目盛はスクロール時も固定表示される契約であること
 *
 * 結合境界:
 * - 単体: buildConditionLineChartData（履歴 → 横スクロールメタデータ）
 * - 結合: getConditionGraphData → ConditionRecordStore
 * - API: GET /api/condition/trainees/:traineeId/graph
 */
describe('U-C11 折れ線グラフの横スクロール', () => {
  const trainerUserId = TRAINER_USER_ID;
  const traineeUserId = TRAINEE_USER_ID;

  function asLineChartWithHorizontalScroll(
    lineChart: ConditionLineChartData,
  ): ConditionLineChartDataWithHorizontalScroll {
    return lineChart as ConditionLineChartDataWithHorizontalScroll;
  }

  function expectLineChartHorizontalScroll(
    lineChart: ConditionLineChartDataWithHorizontalScroll,
    expected: ConditionLineChartHorizontalScroll,
    recordCount: number,
  ): void {
    expect(lineChart.horizontalScroll).toEqual(expected);
    expect(lineChart.horizontalScroll.fixedYAxis).toBe(true);

    if (expected.enabled) {
      expect(lineChart.horizontalScroll.contentWidth).toBeGreaterThan(
        lineChart.horizontalScroll.viewportWidth,
      );
      expect(lineChart.xAxisLabels).toHaveLength(recordCount);
      expect(lineChart.xAxisTicks).toHaveLength(recordCount);
      expect(
        lineChart.series.every(
          (series) => series.values.length === recordCount,
        ),
      ).toBe(true);
    } else {
      expect(lineChart.horizontalScroll.contentWidth).toBeLessThanOrEqual(
        lineChart.horizontalScroll.viewportWidth,
      );
    }
  }

  it('buildConditionLineChartData_記録10件_横スクロール有効のメタデータを返す', () => {
    const lineChart = asLineChartWithHorizontalScroll(
      buildConditionLineChartData(U_C11_SCROLLABLE_HISTORY_RECORDS),
    );

    expectLineChartHorizontalScroll(
      lineChart,
      U_C11_EXPECTED_HORIZONTAL_SCROLL_ENABLED,
      U_C11_SCROLLABLE_HISTORY_RECORDS.length,
    );
    expect(lineChart.horizontalScroll.enabled).toBe(true);
  });

  it('buildConditionLineChartData_記録2件_横スクロール無効のメタデータを返す', () => {
    const lineChart = asLineChartWithHorizontalScroll(
      buildConditionLineChartData(U_C11_NON_SCROLLABLE_HISTORY_RECORDS),
    );

    expectLineChartHorizontalScroll(
      lineChart,
      U_C11_EXPECTED_HORIZONTAL_SCROLL_DISABLED,
      U_C11_NON_SCROLLABLE_HISTORY_RECORDS.length,
    );
    expect(lineChart.horizontalScroll.enabled).toBe(false);
  });

  it('buildConditionLineChartData_履歴なし_横スクロール無効のメタデータを返す', () => {
    const lineChart = asLineChartWithHorizontalScroll(
      buildConditionLineChartData([]),
    );

    expectLineChartHorizontalScroll(
      lineChart,
      U_C11_EXPECTED_HORIZONTAL_SCROLL_EMPTY,
      0,
    );
    expect(lineChart.horizontalScroll.enabled).toBe(false);
  });

  it('getConditionGraphData_記録10件_lineChartに横スクロールメタデータが返る', async () => {
    const conditionRecordStore: ConditionRecordStore = {
      save: vi.fn().mockResolvedValue(undefined),
      findHistoryByTraineeId: vi
        .fn()
        .mockResolvedValue(U_C11_SCROLLABLE_HISTORY_RECORDS),
    };

    const graphData = await getConditionGraphData(
      traineeUserId,
      trainerUserId,
      'trainer',
      conditionRecordStore,
    );

    const lineChart = asLineChartWithHorizontalScroll(graphData.lineChart);

    expect(conditionRecordStore.findHistoryByTraineeId).toHaveBeenCalledWith(
      traineeUserId,
    );
    expectLineChartHorizontalScroll(
      lineChart,
      U_C11_EXPECTED_HORIZONTAL_SCROLL_ENABLED,
      U_C11_SCROLLABLE_HISTORY_RECORDS.length,
    );
  });

  it('getConditionGraphData_InMemoryストア_10回記録後_横スクロール有効のメタデータが返る', async () => {
    const conditionRecordStore = createInMemoryConditionStore();

    for (const record of U_C11_SCROLLABLE_HISTORY_RECORDS) {
      await submitConditionRecord(
        {
          workload: record.workload,
          comprehension: record.comprehension,
          mental: record.mental,
        },
        traineeUserId,
        'trainee',
        conditionRecordStore,
      );
    }

    const graphData = await getConditionGraphData(
      traineeUserId,
      trainerUserId,
      'trainer',
      conditionRecordStore,
    );

    expectLineChartHorizontalScroll(
      asLineChartWithHorizontalScroll(graphData.lineChart),
      U_C11_EXPECTED_HORIZONTAL_SCROLL_ENABLED,
      U_C11_SCROLLABLE_HISTORY_RECORDS.length,
    );
  });

  it('getConditionGraph_トレーナーGET_lineChartに横スクロールメタデータが200で返る', async () => {
    const conditionRecordStore = createInMemoryConditionStore();

    for (const record of U_C11_SCROLLABLE_HISTORY_RECORDS) {
      await submitConditionRecord(
        {
          workload: record.workload,
          comprehension: record.comprehension,
          mental: record.mental,
        },
        traineeUserId,
        'trainee',
        conditionRecordStore,
      );
    }

    const response = await getConditionGraph(
      traineeUserId,
      conditionRecordStore,
    );

    expect(response.statusCode).toBe(200);
    const body = response.body as ConditionGraphData;

    expectLineChartHorizontalScroll(
      asLineChartWithHorizontalScroll(body.lineChart),
      U_C11_EXPECTED_HORIZONTAL_SCROLL_ENABLED,
      U_C11_SCROLLABLE_HISTORY_RECORDS.length,
    );
  });
});

/**
 * U-C12: 折れ線グラフの横軸とプロット点の位置揃え
 * 前提条件: OJTトレーナーとしてログイン中、対象新卒のコンディションが複数回（同一日付の再入力を含む）記録されている
 * アクション: 対象新卒のコンディション画面を開く
 * 期待結果: 各記録の横軸日付ラベルの位置が、対応するデータ点および縦方向グリッド線の x 座標と一致していること
 *           同一日付が複数ある場合は記録ごとに個別位置へ表示されること
 *
 * 結合境界:
 * - 単体: buildConditionLineChartData（履歴 → 横軸位置揃えメタデータ）
 * - 結合: getConditionGraphData → ConditionRecordStore
 * - API: GET /api/condition/trainees/:traineeId/graph
 */
describe('U-C12 折れ線グラフの横軸とプロット点の位置揃え', () => {
  const trainerUserId = TRAINER_USER_ID;
  const traineeUserId = TRAINEE_USER_ID;

  function resolvePlotDisplaySizeForAlignment(
    lineChart: ConditionLineChartDataWithDisplaySize &
      ConditionLineChartDataWithHorizontalScroll,
  ): ConditionLineChartDisplaySize {
    return resolveConditionLineChartPlotDisplaySize(
      lineChart.displaySize,
      lineChart.horizontalScroll,
    );
  }

  function expectLineChartXAxisAlignment(
    lineChart: ConditionLineChartData,
    records: ConditionHistoryRecord[],
  ): void {
    const pointCount = records.length;
    const plotDisplaySize = resolvePlotDisplaySizeForAlignment(
      lineChart as ConditionLineChartDataWithDisplaySize &
        ConditionLineChartDataWithHorizontalScroll,
    );
    const expectedXs = buildConditionLineChartPlotXCoordinates(
      pointCount,
      plotDisplaySize,
    );

    expect(lineChart.xAxisAlignment.labelAnchor).toBe('center');
    expect(lineChart.xAxisAlignment.positions).toHaveLength(pointCount);
    expect(lineChart.xAxisLabels).toHaveLength(pointCount);
    expect(lineChart.xAxisTicks).toHaveLength(pointCount);

    lineChart.xAxisAlignment.positions.forEach((position, index) => {
      expect(position.recordIndex).toBe(index);
      expect(position.label).toBe(records[index]?.recordedAt);
      expect(position.x).toBe(expectedXs[index]);
      expect(lineChart.xAxisLabels[index]).toBe(position.label);
      expect(lineChart.xAxisTicks[index]?.label).toBe(position.label);
      expect(lineChart.xAxisTicks[index]?.x).toBe(position.x);
    });

    const xValues = lineChart.xAxisAlignment.positions.map(
      (position) => position.x,
    );

    expect(new Set(xValues).size).toBe(pointCount);

    for (let index = 1; index < xValues.length; index += 1) {
      expect(xValues[index]).toBeGreaterThan(xValues[index - 1]!);
    }
  }

  it('buildConditionLineChartData_記録3件_横軸ラベルとプロット点のx座標が一致する', () => {
    const lineChart = buildConditionLineChartData(U_C03_HISTORY_RECORDS);

    expectLineChartXAxisAlignment(lineChart, U_C03_HISTORY_RECORDS);
  });

  it('buildConditionLineChartData_同一日付2件_記録ごとに個別のx座標を返す', () => {
    const lineChart = buildConditionLineChartData(U_C09_HISTORY_RECORDS);

    expectLineChartXAxisAlignment(lineChart, U_C09_HISTORY_RECORDS);
    expect(lineChart.xAxisAlignment.positions[0]?.label).toBe('2026-07-13');
    expect(lineChart.xAxisAlignment.positions[1]?.label).toBe('2026-07-13');
    expect(lineChart.xAxisAlignment.positions[0]?.x).not.toBe(
      lineChart.xAxisAlignment.positions[1]?.x,
    );
  });

  it('buildConditionLineChartData_履歴なし_空の位置配列を返す', () => {
    const lineChart = buildConditionLineChartData([]);

    expect(lineChart.xAxisAlignment).toEqual(
      U_C12_EXPECTED_X_AXIS_ALIGNMENT_EMPTY,
    );
    expect(lineChart.xAxisAlignment.positions).toEqual([]);
  });

  it('buildConditionLineChartData_記録1件_中央x座標を返す', () => {
    const singleRecord = U_C03_HISTORY_RECORDS.slice(0, 1);
    const lineChart = buildConditionLineChartData(singleRecord);

    expectLineChartXAxisAlignment(lineChart, singleRecord);
    expect(lineChart.xAxisAlignment.positions[0]?.x).toBe(
      CONDITION_LINE_CHART_DISPLAY_SIZE.paddingLeft +
        CONDITION_LINE_CHART_DISPLAY_SIZE.plotWidth / 2,
    );
  });

  it('buildConditionLineChartData_記録10件_横スクロール時も拡張プロット幅でx座標が一致する', () => {
    const lineChart = buildConditionLineChartData(
      U_C11_SCROLLABLE_HISTORY_RECORDS,
    );

    expect(lineChart.horizontalScroll).toEqual(
      U_C11_EXPECTED_HORIZONTAL_SCROLL_ENABLED,
    );
    expectLineChartXAxisAlignment(lineChart, U_C11_SCROLLABLE_HISTORY_RECORDS);

    const scrollContentDisplaySize =
      buildConditionLineChartScrollContentDisplaySize(
        lineChart.displaySize,
        lineChart.horizontalScroll,
      );
    const expectedLastX = buildConditionLineChartPlotXCoordinates(
      U_C11_SCROLLABLE_HISTORY_RECORDS.length,
      scrollContentDisplaySize,
    ).at(-1);

    expect(lineChart.xAxisAlignment.positions.at(-1)?.x).toBe(expectedLastX);
    expect(lineChart.xAxisAlignment.positions.at(-1)?.x).toBeGreaterThan(
      lineChart.displaySize.paddingLeft + lineChart.displaySize.plotWidth,
    );
  });

  it('getConditionGraphData_記録3件_lineChartに横軸位置揃えが返る', async () => {
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
    expectLineChartXAxisAlignment(graphData.lineChart, U_C03_HISTORY_RECORDS);
  });

  it('getConditionGraphData_同一日付2件_記録ごとに個別x座標が返る', async () => {
    const conditionRecordStore: ConditionRecordStore = {
      save: vi.fn().mockResolvedValue(undefined),
      findHistoryByTraineeId: vi.fn().mockResolvedValue(U_C09_HISTORY_RECORDS),
    };

    const graphData = await getConditionGraphData(
      traineeUserId,
      trainerUserId,
      'trainer',
      conditionRecordStore,
    );

    expectLineChartXAxisAlignment(graphData.lineChart, U_C09_HISTORY_RECORDS);
  });

  it('getConditionGraphData_InMemoryストア_同一日付2回送信後_個別x座標が返る', async () => {
    const conditionRecordStore = createInMemoryConditionStore();

    await submitConditionRecord(
      U_C09_FIRST_INPUT,
      traineeUserId,
      'trainee',
      conditionRecordStore,
    );
    await submitConditionRecord(
      U_C09_SECOND_INPUT,
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

    expectLineChartXAxisAlignment(graphData.lineChart, graphData.rows);
    expect(graphData.rows).toHaveLength(2);
    expect(graphData.rows[0]?.recordedAt).toBe(graphData.rows[1]?.recordedAt);
  });

  it('getConditionGraph_トレーナーGET_lineChartに横軸位置揃えが200で返る', async () => {
    const conditionRecordStore = createInMemoryConditionStore();

    await submitConditionRecord(
      U_C09_FIRST_INPUT,
      traineeUserId,
      'trainee',
      conditionRecordStore,
    );
    await submitConditionRecord(
      U_C09_SECOND_INPUT,
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

    expectLineChartXAxisAlignment(body.lineChart, body.rows);
  });
});

/**
 * U-C13: コンディション推移表のL字マトリクス表示
 * 前提条件: OJTトレーナーとしてログイン中、対象新卒のコンディションが複数回記録されている
 * アクション: 対象新卒のコンディション画面を開く
 * 期待結果: 推移表が L 字型マトリクス（列見出し行＋データ行）の表として表示される契約であること
 *           見出しと値が表構造として区別できる契約であること
 *           列見出しは記録日時・業務量・理解度・メンタルであること
 *
 * 結合境界:
 * - 単体: buildConditionTransitionTable（表行 → L字マトリクス表示メタデータ）
 * - 結合: getConditionGraphData → ConditionRecordStore
 * - API: GET /api/condition/trainees/:traineeId/graph
 */
describe('U-C13 コンディション推移表のL字マトリクス表示', () => {
  const trainerUserId = TRAINER_USER_ID;
  const traineeUserId = TRAINEE_USER_ID;

  function expectTransitionTableMatrixLayout(
    transitionTable: ConditionTransitionTableData,
    dataRowCount: number,
  ): void {
    expect(transitionTable.matrixLayout).toEqual(
      buildConditionTransitionTableMatrixLayout(
        U_C09_TRANSITION_TABLE_COLUMNS,
        dataRowCount,
      ),
    );
    expect(transitionTable.columns).toEqual(U_C09_TRANSITION_TABLE_COLUMNS);
    expect(transitionTable.columns.map((column) => column.label)).toEqual(
      transitionTable.matrixLayout.columnLabels,
    );
    expect(transitionTable.rows).toHaveLength(dataRowCount);
    expect(transitionTable.matrixLayout.dataRowStartIndex).toBeGreaterThan(
      transitionTable.matrixLayout.headerRowIndex,
    );
  }

  it('buildConditionTransitionTable_複数行履歴_L字マトリクス契約を返す', () => {
    const tableRows = buildConditionGraphTableRows(U_C09_HISTORY_RECORDS);
    const transitionTable = buildConditionTransitionTable(tableRows);

    expectTransitionTableMatrixLayout(transitionTable, tableRows.length);
    expect(transitionTable.rows).toEqual(U_C09_EXPECTED_TRANSITION_TABLE.rows);
  });

  it('buildConditionTransitionTable_履歴なし_ヘッダー行のみのL字マトリクス契約を返す', () => {
    const transitionTable = buildConditionTransitionTable([]);

    expectTransitionTableMatrixLayout(transitionTable, 0);
    expect(transitionTable.matrixLayout).toEqual(
      U_C13_EXPECTED_MATRIX_LAYOUT_EMPTY,
    );
    expect(transitionTable.rows).toEqual([]);
  });

  it('buildConditionTransitionTable_列見出しが記録日時業務量理解度メンタルである', () => {
    const transitionTable = buildConditionTransitionTable(
      buildConditionGraphTableRows(U_C03_HISTORY_RECORDS),
    );

    expect(transitionTable.matrixLayout.columnLabels).toEqual(
      U_C09_TRANSITION_TABLE_COLUMNS.map((column) => column.label),
    );
    expect(transitionTable.columns.map((column) => column.key)).toEqual([
      'recordedAt',
      'workload',
      'comprehension',
      'mental',
    ]);
  });

  it('getConditionGraphData_複数回記録_transitionTableにL字マトリクス契約が返る', async () => {
    const conditionRecordStore: ConditionRecordStore = {
      save: vi.fn().mockResolvedValue(undefined),
      findHistoryByTraineeId: vi.fn().mockResolvedValue(U_C09_HISTORY_RECORDS),
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
    expectTransitionTableMatrixLayout(
      graphData.transitionTable,
      U_C09_HISTORY_RECORDS.length,
    );
    expect(graphData.transitionTable.rows).toEqual(
      U_C09_EXPECTED_TRANSITION_TABLE.rows,
    );
  });

  it('getConditionGraphData_InMemoryストア_2回送信後_L字マトリクス契約が返る', async () => {
    const conditionRecordStore = createInMemoryConditionStore();

    await submitConditionRecord(
      U_C09_FIRST_INPUT,
      traineeUserId,
      'trainee',
      conditionRecordStore,
    );
    await submitConditionRecord(
      U_C09_SECOND_INPUT,
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

    expectTransitionTableMatrixLayout(
      graphData.transitionTable,
      graphData.rows.length,
    );
    expect(graphData.transitionTable.rows).toHaveLength(2);
    expect(graphData.transitionTable.rows[0]).toMatchObject(U_C09_FIRST_INPUT);
    expect(graphData.transitionTable.rows[1]).toMatchObject(U_C09_SECOND_INPUT);
  });

  it('getConditionGraph_トレーナーGET_transitionTableにL字マトリクス契約が200で返る', async () => {
    const conditionRecordStore = createInMemoryConditionStore();

    await submitConditionRecord(
      U_C09_FIRST_INPUT,
      traineeUserId,
      'trainee',
      conditionRecordStore,
    );
    await submitConditionRecord(
      U_C09_SECOND_INPUT,
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

    expectTransitionTableMatrixLayout(
      body.transitionTable,
      body.transitionTable.rows.length,
    );
    expect(body.transitionTable.rows[0]).toMatchObject(U_C09_FIRST_INPUT);
    expect(body.transitionTable.rows[1]).toMatchObject(U_C09_SECOND_INPUT);
  });
});

/**
 * U-C14: 折れ線グラフの横軸ラベルの縦位置揃え
 * 前提条件: OJTトレーナーとしてログイン中、対象新卒のコンディションが複数回（同一日付の再入力を含む）記録されている
 * アクション: 対象新卒のコンディション画面を開く
 * 期待結果: 各記録の横軸日付ラベルの縦位置が、プロット領域下端の横軸基準線の高さ（y 座標）に揃っていること
 *           すべての日付ラベルが横軸上に一直線に並ぶこと
 *
 * 結合境界:
 * - 単体: buildConditionLineChartData（履歴 → 横軸ラベル縦位置揃えメタデータ）
 * - 結合: getConditionGraphData → ConditionRecordStore
 * - API: GET /api/condition/trainees/:traineeId/graph
 */
describe('U-C14 折れ線グラフの横軸ラベルの縦位置揃え', () => {
  const trainerUserId = TRAINER_USER_ID;
  const traineeUserId = TRAINEE_USER_ID;

  function resolvePlotDisplaySizeForVerticalAlignment(
    lineChart: ConditionLineChartDataWithDisplaySize &
      ConditionLineChartDataWithHorizontalScroll,
  ): ConditionLineChartDisplaySize {
    return resolveConditionLineChartPlotDisplaySize(
      lineChart.displaySize,
      lineChart.horizontalScroll,
    );
  }

  function expectLineChartXAxisLabelVerticalAlignment(
    lineChart: ConditionLineChartData,
    recordCount: number,
  ): void {
    const plotDisplaySize = resolvePlotDisplaySizeForVerticalAlignment(
      lineChart as ConditionLineChartDataWithDisplaySize &
        ConditionLineChartDataWithHorizontalScroll,
    );

    expect(lineChart.xAxisAlignment).toEqual(
      buildConditionLineChartXAxisAlignment(
        lineChart.xAxisLabels,
        plotDisplaySize,
      ),
    );
    expect(lineChart.xAxisAlignment.positions).toHaveLength(recordCount);
    expect(lineChart.xAxisTicks).toEqual(
      buildConditionLineChartXAxisTicksFromAlignment(lineChart.xAxisAlignment),
    );
  }

  it('buildConditionLineChartData_記録3件_横軸ラベルのy座標が基準線に一致する', () => {
    const lineChart = buildConditionLineChartData(U_C03_HISTORY_RECORDS);

    expectLineChartXAxisLabelVerticalAlignment(
      lineChart,
      U_C03_HISTORY_RECORDS.length,
    );
  });

  it('buildConditionLineChartData_同一日付2件_すべて同じy座標で基準線に揃う', () => {
    const lineChart = buildConditionLineChartData(U_C09_HISTORY_RECORDS);

    expectLineChartXAxisLabelVerticalAlignment(
      lineChart,
      U_C09_HISTORY_RECORDS.length,
    );
    expect(lineChart.xAxisAlignment.positions[0]?.y).toBe(
      lineChart.xAxisAlignment.positions[1]?.y,
    );
  });

  it('buildConditionLineChartData_履歴なし_基準線y座標と空の位置配列を返す', () => {
    const lineChart = buildConditionLineChartData([]);

    expect(lineChart.xAxisAlignment).toEqual(
      U_C12_EXPECTED_X_AXIS_ALIGNMENT_EMPTY,
    );
    expectLineChartXAxisLabelVerticalAlignment(lineChart, 0);
  });

  it('buildConditionLineChartData_記録1件_基準線y座標を返す', () => {
    const singleRecord = U_C03_HISTORY_RECORDS.slice(0, 1);
    const lineChart = buildConditionLineChartData(singleRecord);

    expectLineChartXAxisLabelVerticalAlignment(lineChart, singleRecord.length);
    expect(lineChart.xAxisAlignment.positions[0]?.y).toBe(
      CONDITION_LINE_CHART_DISPLAY_SIZE.paddingTop +
        CONDITION_LINE_CHART_DISPLAY_SIZE.plotHeight,
    );
  });

  it('buildConditionLineChartData_記録10件_横スクロール時も同じ基準線y座標を返す', () => {
    const lineChart = buildConditionLineChartData(
      U_C11_SCROLLABLE_HISTORY_RECORDS,
    );

    expect(lineChart.horizontalScroll).toEqual(
      U_C11_EXPECTED_HORIZONTAL_SCROLL_ENABLED,
    );
    expectLineChartXAxisLabelVerticalAlignment(
      lineChart,
      U_C11_SCROLLABLE_HISTORY_RECORDS.length,
    );

    const scrollContentDisplaySize =
      buildConditionLineChartScrollContentDisplaySize(
        lineChart.displaySize,
        lineChart.horizontalScroll,
      );

    expect(lineChart.xAxisAlignment.baselineY).toBe(
      buildConditionLineChartXAxisBaselineY(scrollContentDisplaySize),
    );
  });

  it('getConditionGraphData_記録3件_lineChartに横軸ラベル縦位置揃えが返る', async () => {
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
    expectLineChartXAxisLabelVerticalAlignment(
      graphData.lineChart,
      U_C03_HISTORY_RECORDS.length,
    );
  });

  it('getConditionGraphData_同一日付2件_すべて同じy座標が返る', async () => {
    const conditionRecordStore: ConditionRecordStore = {
      save: vi.fn().mockResolvedValue(undefined),
      findHistoryByTraineeId: vi.fn().mockResolvedValue(U_C09_HISTORY_RECORDS),
    };

    const graphData = await getConditionGraphData(
      traineeUserId,
      trainerUserId,
      'trainer',
      conditionRecordStore,
    );

    expectLineChartXAxisLabelVerticalAlignment(
      graphData.lineChart,
      U_C09_HISTORY_RECORDS.length,
    );
  });

  it('getConditionGraphData_InMemoryストア_同一日付2回送信後_基準線y座標が返る', async () => {
    const conditionRecordStore = createInMemoryConditionStore();

    await submitConditionRecord(
      U_C09_FIRST_INPUT,
      traineeUserId,
      'trainee',
      conditionRecordStore,
    );
    await submitConditionRecord(
      U_C09_SECOND_INPUT,
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

    expectLineChartXAxisLabelVerticalAlignment(
      graphData.lineChart,
      graphData.rows.length,
    );
  });

  it('getConditionGraph_トレーナーGET_lineChartに横軸ラベル縦位置揃えが200で返る', async () => {
    const conditionRecordStore = createInMemoryConditionStore();

    await submitConditionRecord(
      U_C09_FIRST_INPUT,
      traineeUserId,
      'trainee',
      conditionRecordStore,
    );
    await submitConditionRecord(
      U_C09_SECOND_INPUT,
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

    expectLineChartXAxisLabelVerticalAlignment(
      body.lineChart,
      body.rows.length,
    );
  });
});

/**
 * U-C15: コンディション推移表の罫線付きグリッド表示
 * 前提条件: OJTトレーナーとしてログイン中、対象新卒のコンディションが複数回記録されている
 * アクション: 対象新卒のコンディション画面を開く
 * 期待結果: 記録日時・業務量・理解度・メンタルの各セルが罫線で区切られたグリッド表として表示される契約であること
 *           列見出しセル・データセルそれぞれにセル境界が定義されていること
 *
 * 結合境界:
 * - 単体: buildConditionTransitionTable（表行 → 罫線付きグリッド表示メタデータ）
 * - 結合: getConditionGraphData → ConditionRecordStore
 * - API: GET /api/condition/trainees/:traineeId/graph
 */
describe('U-C15 コンディション推移表の罫線付きグリッド表示', () => {
  const trainerUserId = TRAINER_USER_ID;
  const traineeUserId = TRAINEE_USER_ID;

  function expectTransitionTableCellBorderLayout(
    transitionTable: ConditionTransitionTableData,
    dataRowCount: number,
  ): void {
    expect(transitionTable.cellBorderLayout).toEqual(
      buildConditionTransitionTableCellBorderLayout(
        U_C09_TRANSITION_TABLE_COLUMNS,
        dataRowCount,
      ),
    );
    expect(transitionTable.matrixLayout.columnLabels).toEqual(
      U_C09_TRANSITION_TABLE_COLUMNS.map((column) => column.label),
    );
    expect(transitionTable.rows).toHaveLength(dataRowCount);
  }

  it('buildConditionTransitionTable_複数行履歴_罫線付きグリッド契約を返す', () => {
    const tableRows = buildConditionGraphTableRows(U_C09_HISTORY_RECORDS);
    const transitionTable = buildConditionTransitionTable(tableRows);

    expectTransitionTableCellBorderLayout(transitionTable, tableRows.length);
    expect(transitionTable.rows).toEqual(U_C09_EXPECTED_TRANSITION_TABLE.rows);
  });

  it('buildConditionTransitionTable_履歴なし_ヘッダーセルのみ罫線契約を返す', () => {
    const transitionTable = buildConditionTransitionTable([]);

    expectTransitionTableCellBorderLayout(transitionTable, 0);
    expect(transitionTable.rows).toEqual([]);
  });

  it('getConditionGraphData_複数回記録_transitionTableに罫線付きグリッド契約が返る', async () => {
    const conditionRecordStore: ConditionRecordStore = {
      save: vi.fn().mockResolvedValue(undefined),
      findHistoryByTraineeId: vi.fn().mockResolvedValue(U_C09_HISTORY_RECORDS),
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
    expectTransitionTableCellBorderLayout(
      graphData.transitionTable,
      U_C09_HISTORY_RECORDS.length,
    );
    expect(graphData.transitionTable.rows).toEqual(
      U_C09_EXPECTED_TRANSITION_TABLE.rows,
    );
  });

  it('getConditionGraphData_InMemoryストア_2回送信後_罫線付きグリッド契約が返る', async () => {
    const conditionRecordStore = createInMemoryConditionStore();

    await submitConditionRecord(
      U_C09_FIRST_INPUT,
      traineeUserId,
      'trainee',
      conditionRecordStore,
    );
    await submitConditionRecord(
      U_C09_SECOND_INPUT,
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

    expectTransitionTableCellBorderLayout(
      graphData.transitionTable,
      graphData.rows.length,
    );
    expect(graphData.transitionTable.rows).toHaveLength(2);
    expect(graphData.transitionTable.rows[0]).toMatchObject(U_C09_FIRST_INPUT);
    expect(graphData.transitionTable.rows[1]).toMatchObject(U_C09_SECOND_INPUT);
  });

  it('getConditionGraph_トレーナーGET_transitionTableに罫線付きグリッド契約が200で返る', async () => {
    const conditionRecordStore = createInMemoryConditionStore();

    await submitConditionRecord(
      U_C09_FIRST_INPUT,
      traineeUserId,
      'trainee',
      conditionRecordStore,
    );
    await submitConditionRecord(
      U_C09_SECOND_INPUT,
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

    expectTransitionTableCellBorderLayout(
      body.transitionTable,
      body.transitionTable.rows.length,
    );
    expect(body.transitionTable.rows[0]).toMatchObject(U_C09_FIRST_INPUT);
    expect(body.transitionTable.rows[1]).toMatchObject(U_C09_SECOND_INPUT);
  });
});
