import type {
  ConditionDraft,
  ConditionHistoryRecord,
} from '../domain/conditionTypes.js';
import {
  CONDITION_LINE_CHART_DISPLAY_SIZE,
  CONDITION_LINE_CHART_LEGACY_DISPLAY_SIZE,
  CONDITION_LINE_CHART_SCROLL_MIN_POINT_WIDTH,
  buildConditionLineChartHorizontalScroll,
  buildConditionLineChartXAxisAlignment,
  buildConditionLineChartXAxisTicksFromAlignment,
  buildConditionTransitionTableCellBorderLayout,
  buildConditionTransitionTableMatrixLayout,
  resolveConditionLineChartPlotDisplaySize,
} from '@ojt-app/shared';
import { CONDITION_TRANSITION_TABLE_COLUMNS } from '../domain/conditionConstants.js';
import { InMemoryConditionRecordStore } from '../repositories/inMemoryConditionRecordStore.js';
import type { ConditionRecordStore } from '../repositories/conditionRecordStore.js';
import { invokeConditionRoute } from './conditionRouteTestHelpers.js';

export const TRAINEE_USER_ID = 'trainee-1';
export const TRAINER_USER_ID = 'trainer-1';
export const CONDITION_INVALID_VALUE_ERROR_NAME = 'ConditionInvalidValueError';

export const U_C06_INPUT_DRAFT: ConditionDraft = {
  workload: 2,
  comprehension: 4,
  mental: 5,
};

export const U_C03_HISTORY_RECORDS: ConditionHistoryRecord[] = [
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

export const U_C03_EXPECTED_TABLE_ROWS = U_C03_HISTORY_RECORDS.map(
  ({ recordedAt, workload, comprehension, mental }) => ({
    recordedAt,
    workload,
    comprehension,
    mental,
  }),
);

export const U_C08_Y_AXIS_TICK_VALUES = [1, 2, 3, 4, 5] as const;

export const U_C08_EXPECTED_Y_AXIS_TICKS = U_C08_Y_AXIS_TICK_VALUES.map(
  (value) => ({
    value,
    showGridLine: true,
  }),
);

/** 折れ線グラフ下の補助テキスト（1〜5・日付リスト・数値リスト）を表示しない */
export const U_C08_EXPECTED_SUPPLEMENTAL_DISPLAY = {
  showYAxisRangeText: false,
  showDateList: false,
  showSeriesValueLists: false,
} as const;

/** 改善前（現状）の折れ線グラフ描画サイズ — U-C10 回帰比較用 */
export const U_C10_LEGACY_LINE_CHART_DISPLAY_SIZE =
  CONDITION_LINE_CHART_LEGACY_DISPLAY_SIZE;

/** U-C10: 折れ線グラフの表示サイズ — 縦軸・プロット・横軸を十分に表示できる大きめの寸法 */
export const U_C10_EXPECTED_LINE_CHART_DISPLAY_SIZE =
  CONDITION_LINE_CHART_DISPLAY_SIZE;

const U_C03_X_AXIS_LABELS = ['2026-03-01', '2026-03-08', '2026-03-15'] as const;
const U_C03_HORIZONTAL_SCROLL = buildConditionLineChartHorizontalScroll(3);

export const U_C03_EXPECTED_X_AXIS_ALIGNMENT =
  buildConditionLineChartXAxisAlignment(
    [...U_C03_X_AXIS_LABELS],
    resolveConditionLineChartPlotDisplaySize(
      U_C10_EXPECTED_LINE_CHART_DISPLAY_SIZE,
      U_C03_HORIZONTAL_SCROLL,
    ),
  );

export const U_C12_EXPECTED_X_AXIS_ALIGNMENT_EMPTY =
  buildConditionLineChartXAxisAlignment(
    [],
    resolveConditionLineChartPlotDisplaySize(
      U_C10_EXPECTED_LINE_CHART_DISPLAY_SIZE,
      buildConditionLineChartHorizontalScroll(0),
    ),
  );

export const U_C03_EXPECTED_LINE_CHART = {
  xAxisLabels: [...U_C03_X_AXIS_LABELS],
  yAxisMin: 1,
  yAxisMax: 5,
  yAxisTicks: U_C08_EXPECTED_Y_AXIS_TICKS,
  xAxisTicks: buildConditionLineChartXAxisTicksFromAlignment(
    U_C03_EXPECTED_X_AXIS_ALIGNMENT,
  ),
  supplementalDisplay: U_C08_EXPECTED_SUPPLEMENTAL_DISPLAY,
  displaySize: U_C10_EXPECTED_LINE_CHART_DISPLAY_SIZE,
  horizontalScroll: U_C03_HORIZONTAL_SCROLL,
  xAxisAlignment: U_C03_EXPECTED_X_AXIS_ALIGNMENT,
  series: [
    { key: 'workload', label: '業務量', values: [3, 4, 4] },
    { key: 'comprehension', label: '理解度', values: [3, 3, 2] },
    { key: 'mental', label: 'メンタル', values: [3, 2, 1] },
  ],
} as const;

/** U-C08: 折れ線グラフの軸・目盛表示 — 複数回記録の履歴 */
export const U_C08_HISTORY_RECORDS: ConditionHistoryRecord[] = [
  {
    recordedAt: '2026-07-01',
    workload: 3,
    comprehension: 3,
    mental: 3,
  },
  {
    recordedAt: '2026-07-08',
    workload: 3,
    comprehension: 3,
    mental: 1,
  },
];

const U_C08_HORIZONTAL_SCROLL = buildConditionLineChartHorizontalScroll(
  U_C08_HISTORY_RECORDS.length,
);

export const U_C08_EXPECTED_X_AXIS_ALIGNMENT =
  buildConditionLineChartXAxisAlignment(
    U_C08_HISTORY_RECORDS.map((record) => record.recordedAt),
    resolveConditionLineChartPlotDisplaySize(
      CONDITION_LINE_CHART_DISPLAY_SIZE,
      U_C08_HORIZONTAL_SCROLL,
    ),
  );

export const U_C08_EXPECTED_X_AXIS_TICKS =
  buildConditionLineChartXAxisTicksFromAlignment(
    U_C08_EXPECTED_X_AXIS_ALIGNMENT,
  );

/** U-C10: 折れ線グラフの表示サイズ検証用 — 複数回記録の履歴 */
export const U_C10_HISTORY_RECORDS = U_C08_HISTORY_RECORDS;

/** U-C11: 横スクロール発生に必要な記録件数あたりの最小幅（px） */
export const U_C11_MIN_POINT_WIDTH =
  CONDITION_LINE_CHART_SCROLL_MIN_POINT_WIDTH;

function createU_C11HistoryRecords(
  pointCount: number,
): ConditionHistoryRecord[] {
  return Array.from({ length: pointCount }, (_, index) => ({
    recordedAt: `2026-07-${String(index + 1).padStart(2, '0')}`,
    workload: 3,
    comprehension: 3,
    mental: (index % 5) + 1,
  }));
}

/** U-C11: 画面幅を超え横スクロールが必要な履歴（10 件） */
export const U_C11_SCROLLABLE_HISTORY_RECORDS = createU_C11HistoryRecords(10);

/** U-C11: 画面内に収まり横スクロール不要な履歴（2 件） */
export const U_C11_NON_SCROLLABLE_HISTORY_RECORDS = U_C08_HISTORY_RECORDS;

export const U_C11_EXPECTED_HORIZONTAL_SCROLL_ENABLED =
  buildConditionLineChartHorizontalScroll(
    U_C11_SCROLLABLE_HISTORY_RECORDS.length,
  );

export const U_C11_EXPECTED_HORIZONTAL_SCROLL_DISABLED =
  buildConditionLineChartHorizontalScroll(
    U_C11_NON_SCROLLABLE_HISTORY_RECORDS.length,
  );

export const U_C11_EXPECTED_HORIZONTAL_SCROLL_EMPTY =
  buildConditionLineChartHorizontalScroll(0);

/** U-C09: コンディション推移表の表示 — 仕様書の表示例 */
export const U_C09_TRANSITION_TABLE_COLUMNS =
  CONDITION_TRANSITION_TABLE_COLUMNS;

export const U_C09_HISTORY_RECORDS: ConditionHistoryRecord[] = [
  {
    recordedAt: '2026-07-13',
    workload: 4,
    comprehension: 3,
    mental: 3,
  },
  {
    recordedAt: '2026-07-13',
    workload: 4,
    comprehension: 3,
    mental: 1,
  },
];

export const U_C09_EXPECTED_TABLE_ROWS = U_C09_HISTORY_RECORDS.map(
  ({ recordedAt, workload, comprehension, mental }) => ({
    recordedAt,
    workload,
    comprehension,
    mental,
  }),
);

export const U_C09_EXPECTED_TRANSITION_TABLE = {
  columns: U_C09_TRANSITION_TABLE_COLUMNS,
  rows: U_C09_EXPECTED_TABLE_ROWS,
  matrixLayout: buildConditionTransitionTableMatrixLayout(
    U_C09_TRANSITION_TABLE_COLUMNS,
    U_C09_EXPECTED_TABLE_ROWS.length,
  ),
  cellBorderLayout: buildConditionTransitionTableCellBorderLayout(
    U_C09_TRANSITION_TABLE_COLUMNS,
    U_C09_EXPECTED_TABLE_ROWS.length,
  ),
} as const;

export const U_C13_EXPECTED_MATRIX_LAYOUT_EMPTY =
  buildConditionTransitionTableMatrixLayout(U_C09_TRANSITION_TABLE_COLUMNS, 0);

export const U_C15_EXPECTED_CELL_BORDER_LAYOUT_EMPTY =
  buildConditionTransitionTableCellBorderLayout(
    U_C09_TRANSITION_TABLE_COLUMNS,
    0,
  );

export const U_C09_FIRST_INPUT: ConditionDraft = {
  workload: 4,
  comprehension: 3,
  mental: 3,
};

export const U_C09_SECOND_INPUT: ConditionDraft = {
  workload: 4,
  comprehension: 3,
  mental: 1,
};

export function createInMemoryConditionStore(): InMemoryConditionRecordStore {
  return new InMemoryConditionRecordStore();
}

export function expectConditionDraftValues(
  actual: ConditionDraft,
  expected: ConditionDraft,
): void {
  expect(actual.workload).toBe(expected.workload);
  expect(actual.comprehension).toBe(expected.comprehension);
  expect(actual.mental).toBe(expected.mental);
}

const TRAINEE_HEADERS = {
  'x-user-id': TRAINEE_USER_ID,
  'x-user-role': 'trainee',
} as const;

const TRAINER_HEADERS = {
  'x-user-id': TRAINER_USER_ID,
  'x-user-role': 'trainer',
} as const;

export async function postCondition(
  body: unknown,
  conditionRecordStore: ConditionRecordStore,
  headers: Record<string, string> = TRAINEE_HEADERS,
): Promise<{ statusCode: number; body: unknown }> {
  return invokeConditionRoute(conditionRecordStore, {
    method: 'post',
    path: '/condition',
    body,
    headers,
  });
}

export async function getConditionGraph(
  traineeId: string,
  conditionRecordStore: ConditionRecordStore,
  headers: Record<string, string> = TRAINER_HEADERS,
): Promise<{ statusCode: number; body: unknown }> {
  return invokeConditionRoute(conditionRecordStore, {
    method: 'get',
    path: '/condition/trainees/:traineeId/graph',
    params: { traineeId },
    headers,
  });
}

export async function getConditionAlerts(
  conditionRecordStore: ConditionRecordStore,
  headers: Record<string, string> = TRAINER_HEADERS,
): Promise<{ statusCode: number; body: unknown }> {
  return invokeConditionRoute(conditionRecordStore, {
    method: 'get',
    path: '/condition/alerts',
    headers,
  });
}

export async function getConditionPageAlert(
  traineeId: string,
  conditionRecordStore: ConditionRecordStore,
  headers: Record<string, string> = TRAINER_HEADERS,
): Promise<{ statusCode: number; body: unknown }> {
  return invokeConditionRoute(conditionRecordStore, {
    method: 'get',
    path: '/condition/trainees/:traineeId/page-alert',
    params: { traineeId },
    headers,
  });
}
