import { test, expect, type Page } from '@playwright/test';

// コンディション E2E は同一 API の InMemory ストアを共有するため、並列実行しない
test.describe.configure({ mode: 'serial' });

const CONDITION_SUBMIT_MESSAGE = '記録しました';
const CONDITION_ALERT_MESSAGE = '要フォロー';
const CONDITION_PAGE_ALERT_MESSAGE = '新卒が不安定です。';
const TRAINEE_ID = 'trainee-1';
const E_C01_MENTAL_VALUE = 1;
const E_C03_CONDITION_INPUT = {
  workload: 2,
  comprehension: 4,
  mental: 5,
} as const;
const E_C04_FIRST_INPUT = {
  workload: 1,
  comprehension: 2,
  mental: 3,
} as const;
const E_C04_SECOND_INPUT = {
  workload: 4,
  comprehension: 3,
  mental: 2,
} as const;
const E_C06_FIRST_INPUT = {
  workload: 3,
  comprehension: 3,
  mental: 3,
} as const;
const E_C06_SECOND_INPUT = {
  workload: 3,
  comprehension: 3,
  mental: 1,
} as const;
const E_C07_FIRST_INPUT = {
  workload: 4,
  comprehension: 3,
  mental: 3,
} as const;
const E_C07_SECOND_INPUT = {
  workload: 4,
  comprehension: 3,
  mental: 1,
} as const;
const E_C12_FIRST_INPUT = E_C07_FIRST_INPUT;
const E_C12_SECOND_INPUT = E_C07_SECOND_INPUT;
const E_C12_X_AXIS_LABEL_BASELINE_TOLERANCE_PX = 1;
const E_C13_FIRST_INPUT = E_C07_FIRST_INPUT;
const E_C13_SECOND_INPUT = E_C07_SECOND_INPUT;
const E_C13_EXPECTED_CELL_BORDER_SIDES = {
  top: true,
  right: true,
  bottom: true,
  left: true,
} as const;
const E_C07_TRANSITION_TABLE_COLUMN_LABELS = [
  '記録日時',
  '業務量',
  '理解度',
  'メンタル',
] as const;
const E_C06_Y_AXIS_TICK_VALUES = ['1', '2', '3', '4', '5'] as const;
const CONDITION_LINE_CHART_Y_AXIS_TICKS_LABEL = '縦軸目盛';
const CONDITION_LINE_CHART_X_AXIS_TICKS_LABEL = '横軸目盛';
const CONDITION_LINE_CHART_GRID_LABEL = '折れ線グラフグリッド';

type ConditionSliderLabel = '業務量' | '理解度' | 'メンタル';

type ConditionValues = {
  workload: number;
  comprehension: number;
  mental: number;
};

type ConditionTransitionTableRow = ConditionValues & {
  recordedAt: string;
};

type ConditionTransitionTableCellBorderSidesApiData = {
  top: boolean;
  right: boolean;
  bottom: boolean;
  left: boolean;
};

type ConditionTransitionTableCellBorderLayoutApiData = {
  variant: 'grid';
  headerCellBorder: ConditionTransitionTableCellBorderSidesApiData;
  dataCellBorder: ConditionTransitionTableCellBorderSidesApiData;
  columnCount: number;
  headerCellCount: number;
  dataCellCount: number;
};

type ConditionGraphTransitionTableApiData = {
  columns: Array<{ key: string; label: string }>;
  rows: ConditionTransitionTableRow[];
  cellBorderLayout: ConditionTransitionTableCellBorderLayoutApiData;
};

async function loginAsTrainee(page: Page): Promise<void> {
  await page.goto('/login');
  await page.getByRole('button', { name: '新卒としてログイン' }).click();
}

async function loginAsTrainer(page: Page): Promise<void> {
  await page.goto('/login');
  await page.getByRole('button', { name: 'トレーナーとしてログイン' }).click();
}

async function loginAsTrainerAndWaitForDashboardAlerts(
  page: Page,
): Promise<void> {
  await page.goto('/login');

  const alertsResponse = page.waitForResponse(
    (response) =>
      response.url().includes('/api/condition/alerts') &&
      response.request().method() === 'GET' &&
      response.ok(),
  );

  await page.getByRole('button', { name: 'トレーナーとしてログイン' }).click();
  await expect(
    page.getByRole('heading', { name: 'ダッシュボード' }),
  ).toBeVisible();
  await alertsResponse;
}

async function openWeeklyConditionInput(page: Page): Promise<void> {
  await page.getByRole('link', { name: '週次入力' }).click();
  await expect(
    page.getByRole('heading', { name: '週次コンディション入力' }),
  ).toBeVisible();
}

async function setConditionSlider(
  page: Page,
  label: ConditionSliderLabel,
  value: number,
): Promise<void> {
  await page.getByRole('slider', { name: label }).fill(String(value));
}

async function setConditionValues(
  page: Page,
  values: ConditionValues,
): Promise<void> {
  await setConditionSlider(page, '業務量', values.workload);
  await setConditionSlider(page, '理解度', values.comprehension);
  await setConditionSlider(page, 'メンタル', values.mental);
}

async function setMentalValue(page: Page, value: number): Promise<void> {
  await setConditionSlider(page, 'メンタル', value);
}

async function submitWeeklyCondition(page: Page): Promise<void> {
  const submitResponse = page.waitForResponse(
    (response) =>
      response.url().includes('/api/condition') &&
      response.request().method() === 'POST' &&
      response.ok(),
  );

  await page.getByRole('button', { name: '記録する' }).click();

  await submitResponse;
  await expect(page.getByText(CONDITION_SUBMIT_MESSAGE)).toBeVisible();
}

function traineeAlertCard(page: Page, traineeId: string) {
  return page.getByRole('article', { name: `新卒 ${traineeId}` });
}

async function expectTraineeAlertOnDashboard(
  page: Page,
  traineeId: string,
  message: string,
): Promise<void> {
  await expect(
    traineeAlertCard(page, traineeId).getByText(message),
  ).toBeVisible();
}

async function openTraineeDetail(page: Page, traineeId: string): Promise<void> {
  const latestResponse = page.waitForResponse(
    (response) =>
      response.url().includes(`/api/condition/trainees/${traineeId}/latest`) &&
      response.request().method() === 'GET' &&
      response.ok(),
  );

  await page.getByRole('link', { name: `新卒 ${traineeId} の詳細` }).click();
  await expect(
    page.getByRole('heading', { name: `新卒 ${traineeId} の詳細` }),
  ).toBeVisible();
  await latestResponse;
}

async function expectTraineeDetailMentalValue(
  page: Page,
  mental: number,
): Promise<void> {
  await expect(
    page.getByRole('term').filter({ hasText: 'メンタル' }).locator('+ dd'),
  ).toHaveText(String(mental));
}

function trainerHeaderNav(page: Page) {
  return page.getByRole('navigation', { name: 'メインナビゲーション' });
}

async function expectTrainerConditionNavLink(page: Page): Promise<void> {
  await expect(
    trainerHeaderNav(page).getByRole('link', { name: 'コンディション' }),
  ).toBeVisible();
}

async function logout(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'ログアウト' }).click();
  await expect(page.getByRole('heading', { name: 'ログイン' })).toBeVisible();
}

async function openTrainerConditionPageWithPageAlert(
  page: Page,
  traineeId: string = TRAINEE_ID,
): Promise<void> {
  const latestResponse = page.waitForResponse(
    (response) =>
      response.url().includes(`/api/condition/trainees/${traineeId}/latest`) &&
      response.request().method() === 'GET' &&
      response.ok(),
  );
  const pageAlertResponse = page.waitForResponse(
    (response) =>
      response
        .url()
        .includes(`/api/condition/trainees/${traineeId}/page-alert`) &&
      response.request().method() === 'GET' &&
      response.ok(),
  );

  await trainerHeaderNav(page)
    .getByRole('link', { name: 'コンディション' })
    .click();
  await expect(
    page.getByRole('heading', { name: 'コンディション' }),
  ).toBeVisible();
  await Promise.all([latestResponse, pageAlertResponse]);
}

async function expectConditionPageUnstableAlert(page: Page): Promise<void> {
  const alert = page.getByRole('alert', { name: 'コンディションアラート' });
  await expect(alert).toBeVisible();
  await expect(alert).toContainText(CONDITION_PAGE_ALERT_MESSAGE);
}

async function openTrainerConditionPage(page: Page): Promise<void> {
  const latestResponse = page.waitForResponse(
    (response) =>
      response.url().includes('/api/condition/trainees/') &&
      response.url().includes('/latest') &&
      response.request().method() === 'GET' &&
      response.ok(),
  );

  await trainerHeaderNav(page)
    .getByRole('link', { name: 'コンディション' })
    .click();
  await expect(
    page.getByRole('heading', { name: 'コンディション' }),
  ).toBeVisible();
  await latestResponse;
}

async function openTrainerConditionPageWithGraph(
  page: Page,
  traineeId: string = TRAINEE_ID,
): Promise<void> {
  const latestResponse = page.waitForResponse(
    (response) =>
      response.url().includes(`/api/condition/trainees/${traineeId}/latest`) &&
      response.request().method() === 'GET' &&
      response.ok(),
  );
  const graphResponse = page.waitForResponse(
    (response) =>
      response.url().includes(`/api/condition/trainees/${traineeId}/graph`) &&
      response.request().method() === 'GET' &&
      response.ok(),
  );

  await trainerHeaderNav(page)
    .getByRole('link', { name: 'コンディション' })
    .click();
  await expect(
    page.getByRole('heading', { name: 'コンディション' }),
  ).toBeVisible();
  await Promise.all([latestResponse, graphResponse]);
}

async function reopenTrainerConditionPageWithGraph(
  page: Page,
  traineeId: string = TRAINEE_ID,
): Promise<void> {
  await page.getByRole('link', { name: 'ダッシュボード' }).click();
  await expect(
    page.getByRole('heading', { name: 'ダッシュボード' }),
  ).toBeVisible();
  await openTrainerConditionPageWithGraph(page, traineeId);
}

function trainerConditionTransitionTableRegion(page: Page) {
  return page.getByRole('region', { name: 'コンディション推移グラフ' });
}

function conditionTransitionTableRows(page: Page) {
  return trainerConditionTransitionTableRegion(page).locator('tbody tr');
}

async function expectConditionTransitionTableStructure(
  page: Page,
): Promise<void> {
  const tableRegion = trainerConditionTransitionTableRegion(page);
  await expect(tableRegion.locator('table')).toBeVisible();
  await expect(
    tableRegion.getByRole('columnheader', { name: '記録日時' }),
  ).toBeVisible();
  await expect(
    tableRegion.getByRole('columnheader', { name: '業務量' }),
  ).toBeVisible();
  await expect(
    tableRegion.getByRole('columnheader', { name: '理解度' }),
  ).toBeVisible();
  await expect(
    tableRegion.getByRole('columnheader', { name: 'メンタル' }),
  ).toBeVisible();
}

async function expectConditionTransitionTableBelowCurrentCondition(
  page: Page,
): Promise<void> {
  const currentRegion = trainerCurrentConditionRegion(page);
  const tableRegion = trainerConditionTransitionTableRegion(page);

  await expect(currentRegion).toBeVisible();
  await expect(tableRegion).toBeVisible();

  const [currentBox, tableBox] = await Promise.all([
    currentRegion.boundingBox(),
    tableRegion.boundingBox(),
  ]);

  expect(currentBox).not.toBeNull();
  expect(tableBox).not.toBeNull();
  expect(tableBox!.y).toBeGreaterThan(currentBox!.y);
}

async function expectConditionTransitionTableLatestRow(
  page: Page,
  values: ConditionValues,
): Promise<void> {
  const latestRow = conditionTransitionTableRows(page).last();

  await expect(latestRow).toContainText(String(values.workload));
  await expect(latestRow).toContainText(String(values.comprehension));
  await expect(latestRow).toContainText(String(values.mental));
}

async function countConditionTransitionTableRows(page: Page): Promise<number> {
  return conditionTransitionTableRows(page).count();
}

async function expectConditionTransitionTableBelowLineChart(
  page: Page,
): Promise<void> {
  const lineChart = trainerConditionLineChartImage(page);
  const table = trainerConditionTransitionTableRegion(page).locator('table');

  await expect(lineChart).toBeVisible();
  await expect(table).toBeVisible();

  const [chartBox, tableBox] = await Promise.all([
    lineChart.boundingBox(),
    table.boundingBox(),
  ]);

  expect(chartBox).not.toBeNull();
  expect(tableBox).not.toBeNull();
  expect(tableBox!.y).toBeGreaterThan(chartBox!.y);
}

async function expectConditionTransitionTableRowsMatchApi(
  page: Page,
  transitionTable: ConditionGraphTransitionTableApiData,
): Promise<void> {
  const rows = conditionTransitionTableRows(page);
  await expect(rows).toHaveCount(transitionTable.rows.length);

  for (let index = 0; index < transitionTable.rows.length; index += 1) {
    const expected = transitionTable.rows[index];
    const cells = rows.nth(index).locator('td');

    await expect(cells.nth(0)).toHaveText(expected.recordedAt);
    await expect(cells.nth(1)).toHaveText(String(expected.workload));
    await expect(cells.nth(2)).toHaveText(String(expected.comprehension));
    await expect(cells.nth(3)).toHaveText(String(expected.mental));
  }
}

async function expectConditionTransitionTableColumnsFromApi(
  page: Page,
  transitionTable: ConditionGraphTransitionTableApiData,
): Promise<void> {
  const tableRegion = trainerConditionTransitionTableRegion(page);

  for (const column of transitionTable.columns) {
    await expect(
      tableRegion.getByRole('columnheader', { name: column.label }),
    ).toBeVisible();
  }
}

function trainerConditionTransitionTable(page: Page) {
  return trainerConditionTransitionTableRegion(page).locator(
    'table.condition-transition-table--grid',
  );
}

function conditionTransitionTableHeaderCells(page: Page) {
  return trainerConditionTransitionTable(page).getByRole('columnheader');
}

function conditionTransitionTableDataCells(page: Page) {
  return trainerConditionTransitionTable(page).getByRole('cell');
}

async function expectConditionTransitionTableCellHasGridBorder(
  cell: ReturnType<Page['locator']>,
): Promise<void> {
  const borders = await cell.evaluate((element) => {
    const style = window.getComputedStyle(element);

    return {
      top: Number.parseFloat(style.borderTopWidth),
      right: Number.parseFloat(style.borderRightWidth),
      bottom: Number.parseFloat(style.borderBottomWidth),
      left: Number.parseFloat(style.borderLeftWidth),
    };
  });

  expect(borders.top).toBeGreaterThan(0);
  expect(borders.right).toBeGreaterThan(0);
  expect(borders.bottom).toBeGreaterThan(0);
  expect(borders.left).toBeGreaterThan(0);
}

function expectConditionTransitionTableCellBorderLayoutContract(
  transitionTable: ConditionGraphTransitionTableApiData,
): void {
  const { cellBorderLayout, columns, rows } = transitionTable;

  expect(cellBorderLayout.variant).toBe('grid');
  expect(cellBorderLayout.columnCount).toBe(columns.length);
  expect(cellBorderLayout.headerCellCount).toBe(columns.length);
  expect(cellBorderLayout.dataCellCount).toBe(columns.length * rows.length);
  expect(cellBorderLayout.headerCellBorder).toEqual(
    E_C13_EXPECTED_CELL_BORDER_SIDES,
  );
  expect(cellBorderLayout.dataCellBorder).toEqual(
    E_C13_EXPECTED_CELL_BORDER_SIDES,
  );
}

async function expectConditionTransitionTableBorderedGridVisible(
  page: Page,
  transitionTable: ConditionGraphTransitionTableApiData,
): Promise<void> {
  const table = trainerConditionTransitionTable(page);
  await expect(table).toBeVisible();

  const headerCells = conditionTransitionTableHeaderCells(page);
  const dataCells = conditionTransitionTableDataCells(page);

  await expect(headerCells).toHaveCount(
    transitionTable.cellBorderLayout.headerCellCount,
  );
  await expect(dataCells).toHaveCount(
    transitionTable.cellBorderLayout.dataCellCount,
  );

  for (
    let index = 0;
    index < transitionTable.cellBorderLayout.headerCellCount;
    index += 1
  ) {
    await expectConditionTransitionTableCellHasGridBorder(
      headerCells.nth(index),
    );
  }

  for (
    let index = 0;
    index < transitionTable.cellBorderLayout.dataCellCount;
    index += 1
  ) {
    await expectConditionTransitionTableCellHasGridBorder(dataCells.nth(index));
  }
}

async function expectConditionTransitionTableBorderedGrid(
  page: Page,
  transitionTable: ConditionGraphTransitionTableApiData,
): Promise<void> {
  expectConditionTransitionTableCellBorderLayoutContract(transitionTable);
  await expectConditionTransitionTableStructure(page);
  await expectConditionTransitionTableBelowLineChart(page);
  await expectConditionTransitionTableColumnsFromApi(page, transitionTable);
  await expectConditionTransitionTableBorderedGridVisible(
    page,
    transitionTable,
  );
  await expectConditionTransitionTableRowsMatchApi(page, transitionTable);
}

function trainerConditionTransitionGraphRegion(page: Page) {
  return page.getByRole('region', { name: 'コンディション推移グラフ' });
}

function trainerConditionLineChartImage(page: Page) {
  return trainerConditionTransitionGraphRegion(page).getByRole('img', {
    name: 'コンディション推移折れ線グラフ',
  });
}

async function expectConditionLineChartStructure(page: Page): Promise<void> {
  const graphRegion = trainerConditionTransitionGraphRegion(page);

  await expect(graphRegion).toBeVisible();
  await expect(trainerConditionLineChartImage(page)).toBeVisible();
  await expectConditionLineChartYAxisTicks(page);
  await expect(trainerConditionLineChartXAxisTicks(page)).toBeVisible();
  await expectConditionLineChartGridVisible(page);
  await expectConditionLineChartSupplementalTextHidden(page);
  await expect(
    trainerConditionLineChartImage(page).locator('polyline'),
  ).toHaveCount(3);
}

async function expectConditionLineChartBelowCurrentCondition(
  page: Page,
): Promise<void> {
  const currentRegion = trainerCurrentConditionRegion(page);
  const graphRegion = trainerConditionTransitionGraphRegion(page);

  await expect(currentRegion).toBeVisible();
  await expect(graphRegion).toBeVisible();

  const [currentBox, graphBox] = await Promise.all([
    currentRegion.boundingBox(),
    graphRegion.boundingBox(),
  ]);

  expect(currentBox).not.toBeNull();
  expect(graphBox).not.toBeNull();
  expect(graphBox!.y).toBeGreaterThan(currentBox!.y);
}

async function countConditionLineChartXAxisLabels(page: Page): Promise<number> {
  return trainerConditionLineChartXAxisTicks(page)
    .getByRole('listitem')
    .count();
}

type ConditionGraphLineChartApiData = {
  xAxisLabels: string[];
  yAxisTicks: Array<{ value: number; showGridLine: boolean }>;
  xAxisTicks: Array<{
    label: string;
    showGridLine: boolean;
    x: number;
    y: number;
  }>;
  xAxisAlignment: ConditionLineChartXAxisAlignmentApiData;
  supplementalDisplay: {
    showYAxisRangeText: boolean;
    showDateList: boolean;
    showSeriesValueLists: boolean;
  };
};

type ConditionLineChartXAxisAlignmentApiData = {
  labelAnchor: 'center';
  labelBaseline: 'bottom';
  baselineY: number;
  positions: Array<{
    recordIndex: number;
    label: string;
    x: number;
    y: number;
  }>;
};

async function openTrainerConditionPageWithGraphData(
  page: Page,
  traineeId: string = TRAINEE_ID,
): Promise<ConditionGraphLineChartApiData> {
  const latestResponse = page.waitForResponse(
    (response) =>
      response.url().includes(`/api/condition/trainees/${traineeId}/latest`) &&
      response.request().method() === 'GET' &&
      response.ok(),
  );
  const graphResponse = page.waitForResponse(
    (response) =>
      response.url().includes(`/api/condition/trainees/${traineeId}/graph`) &&
      response.request().method() === 'GET' &&
      response.ok(),
  );

  await trainerHeaderNav(page)
    .getByRole('link', { name: 'コンディション' })
    .click();
  await expect(
    page.getByRole('heading', { name: 'コンディション' }),
  ).toBeVisible();
  await Promise.all([latestResponse, graphResponse]);

  const body = (await (await graphResponse).json()) as {
    lineChart: ConditionGraphLineChartApiData;
  };

  return body.lineChart;
}

async function openTrainerConditionPageWithGraphAndTransitionTable(
  page: Page,
  traineeId: string = TRAINEE_ID,
): Promise<{
  lineChart: ConditionGraphLineChartApiData;
  transitionTable: ConditionGraphTransitionTableApiData;
}> {
  const latestResponse = page.waitForResponse(
    (response) =>
      response.url().includes(`/api/condition/trainees/${traineeId}/latest`) &&
      response.request().method() === 'GET' &&
      response.ok(),
  );
  const graphResponse = page.waitForResponse(
    (response) =>
      response.url().includes(`/api/condition/trainees/${traineeId}/graph`) &&
      response.request().method() === 'GET' &&
      response.ok(),
  );

  await trainerHeaderNav(page)
    .getByRole('link', { name: 'コンディション' })
    .click();
  await expect(
    page.getByRole('heading', { name: 'コンディション' }),
  ).toBeVisible();
  await Promise.all([latestResponse, graphResponse]);

  const body = (await (await graphResponse).json()) as {
    lineChart: ConditionGraphLineChartApiData;
    transitionTable: ConditionGraphTransitionTableApiData;
  };

  return {
    lineChart: body.lineChart,
    transitionTable: body.transitionTable,
  };
}

function trainerConditionLineChartYAxisTicks(page: Page) {
  return trainerConditionTransitionGraphRegion(page).getByRole('list', {
    name: CONDITION_LINE_CHART_Y_AXIS_TICKS_LABEL,
  });
}

function trainerConditionLineChartXAxisTicks(page: Page) {
  return trainerConditionTransitionGraphRegion(page).getByRole('list', {
    name: CONDITION_LINE_CHART_X_AXIS_TICKS_LABEL,
  });
}

function trainerConditionLineChartXAxisTickItems(page: Page) {
  return trainerConditionLineChartXAxisTicks(page).getByRole('listitem');
}

async function collectXAxisTickBottomEdges(page: Page): Promise<number[]> {
  const tickItems = trainerConditionLineChartXAxisTickItems(page);
  const tickCount = await tickItems.count();
  const bottomEdges: number[] = [];

  for (let index = 0; index < tickCount; index += 1) {
    const box = await tickItems.nth(index).boundingBox();
    expect(box).not.toBeNull();
    bottomEdges.push(box!.y + box!.height);
  }

  return bottomEdges;
}

async function expectConditionLineChartXAxisLabelsAlignedOnBaseline(
  page: Page,
): Promise<void> {
  const bottomEdges = await collectXAxisTickBottomEdges(page);

  expect(bottomEdges.length).toBeGreaterThanOrEqual(2);

  const referenceBottom = bottomEdges[0]!;

  for (const bottomEdge of bottomEdges) {
    expect(Math.abs(bottomEdge - referenceBottom)).toBeLessThanOrEqual(
      E_C12_X_AXIS_LABEL_BASELINE_TOLERANCE_PX,
    );
  }
}

function expectConditionLineChartXAxisVerticalAlignmentContract(
  lineChart: ConditionGraphLineChartApiData,
): void {
  expect(lineChart.xAxisAlignment.labelBaseline).toBe('bottom');
  expect(lineChart.xAxisAlignment.positions.length).toBeGreaterThanOrEqual(2);
  expect(lineChart.xAxisTicks).toHaveLength(
    lineChart.xAxisAlignment.positions.length,
  );

  const { baselineY } = lineChart.xAxisAlignment;

  expect(
    lineChart.xAxisAlignment.positions.every(
      (position) => position.y === baselineY,
    ),
  ).toBe(true);
  expect(lineChart.xAxisTicks.every((tick) => tick.y === baselineY)).toBe(true);

  lineChart.xAxisAlignment.positions.forEach((position, index) => {
    expect(lineChart.xAxisTicks[index]).toMatchObject({
      label: position.label,
      showGridLine: true,
      x: position.x,
      y: position.y,
    });
  });
}

async function expectConditionLineChartXAxisLabelVerticalAlignment(
  page: Page,
  lineChart: ConditionGraphLineChartApiData,
): Promise<void> {
  expectConditionLineChartXAxisVerticalAlignmentContract(lineChart);
  await expectConditionLineChartXAxisTicks(page, lineChart.xAxisLabels);
  await expectConditionLineChartXAxisLabelsAlignedOnBaseline(page);
}

async function expectConditionLineChartYAxisTicks(page: Page): Promise<void> {
  const yAxisTicks = trainerConditionLineChartYAxisTicks(page);
  await expect(yAxisTicks).toBeVisible();

  for (const tick of E_C06_Y_AXIS_TICK_VALUES) {
    await expect(
      yAxisTicks.getByRole('listitem', { name: tick }),
    ).toBeVisible();
  }
}

async function expectConditionLineChartXAxisTicks(
  page: Page,
  expectedLabels: string[],
): Promise<void> {
  const xAxisTicks = trainerConditionLineChartXAxisTicks(page);
  await expect(xAxisTicks).toBeVisible();
  const items = xAxisTicks.getByRole('listitem');
  await expect(items).toHaveCount(expectedLabels.length);

  await expect(items).toHaveText(expectedLabels);
}

async function expectConditionLineChartGridVisible(page: Page): Promise<void> {
  await expect(
    trainerConditionTransitionGraphRegion(page).getByRole('group', {
      name: CONDITION_LINE_CHART_GRID_LABEL,
    }),
  ).toBeVisible();
}

async function expectConditionLineChartAxisAndGrid(
  page: Page,
  lineChart: ConditionGraphLineChartApiData,
): Promise<void> {
  const graphRegion = trainerConditionTransitionGraphRegion(page);

  await expect(graphRegion).toBeVisible();
  await expect(trainerConditionLineChartImage(page)).toBeVisible();
  await expectConditionLineChartYAxisTicks(page);
  await expectConditionLineChartXAxisTicks(page, lineChart.xAxisLabels);
  await expectConditionLineChartGridVisible(page);

  expect(lineChart.yAxisTicks.map((tick) => tick.value)).toEqual([
    1, 2, 3, 4, 5,
  ]);
  expect(lineChart.yAxisTicks.every((tick) => tick.showGridLine)).toBe(true);
  expect(
    lineChart.xAxisTicks.map(({ label, showGridLine }) => ({
      label,
      showGridLine,
    })),
  ).toEqual(
    lineChart.xAxisLabels.map((label) => ({
      label,
      showGridLine: true,
    })),
  );
  lineChart.xAxisAlignment.positions.forEach((position, index) => {
    expect(lineChart.xAxisTicks[index]).toMatchObject({
      label: position.label,
      showGridLine: true,
      x: position.x,
      y: position.y,
    });
  });
}

async function expectConditionLineChartSupplementalTextHidden(
  page: Page,
): Promise<void> {
  const graphRegion = trainerConditionTransitionGraphRegion(page);

  await expect(graphRegion.getByText('1〜5')).toHaveCount(0);
  await expect(graphRegion.getByRole('list', { name: '記録日時' })).toHaveCount(
    0,
  );
  await expect(
    graphRegion.getByRole('list', { name: '折れ線グラフ系列' }),
  ).toHaveCount(0);
}

function trainerCurrentConditionRegion(page: Page) {
  return page.getByRole('region', { name: '現在のコンディション' });
}

async function expectTrainerCurrentConditionValues(
  page: Page,
  values: ConditionValues,
): Promise<void> {
  const region = trainerCurrentConditionRegion(page);
  await expect(region).toBeVisible();

  await expect(
    region.getByRole('term').filter({ hasText: '業務量' }).locator('+ dd'),
  ).toHaveText(String(values.workload));
  await expect(
    region.getByRole('term').filter({ hasText: '理解度' }).locator('+ dd'),
  ).toHaveText(String(values.comprehension));
  await expect(
    region.getByRole('term').filter({ hasText: 'メンタル' }).locator('+ dd'),
  ).toHaveText(String(values.mental));
}

/**
 * E-C01: 温度計入力からアラート確認のEnd-to-End
 * 観点: CUJ / 連携 / 操作性
 *
 * 手順:
 * 1. 新卒でログインし、週次入力画面を開く
 * 2. メンタルを「1」に設定して送信
 * 3. トレーナーでログインし、ダッシュボードを開く
 *
 * 期待結果（表示）:
 * - ダッシュボード上で該当新卒のアラート通知が表示される
 * - 詳細画面で「メンタル=1」の記録が確認できる
 *
 * 期待結果（データ）:
 * - POST /api/condition が成功し、GET /api/condition/alerts・latest に反映される
 */
test.describe('E-C01 温度計入力からアラート確認のEnd-to-End', () => {
  test('新卒入力からトレーナー確認_アラートと記録が表示される', async ({
    page,
  }) => {
    await loginAsTrainee(page);
    await openWeeklyConditionInput(page);
    await setMentalValue(page, E_C01_MENTAL_VALUE);
    await submitWeeklyCondition(page);

    await logout(page);
    await loginAsTrainerAndWaitForDashboardAlerts(page);

    await expectTraineeAlertOnDashboard(
      page,
      TRAINEE_ID,
      CONDITION_ALERT_MESSAGE,
    );

    await openTraineeDetail(page, TRAINEE_ID);
    await expectTraineeDetailMentalValue(page, E_C01_MENTAL_VALUE);
  });
});

/**
 * E-C02: トレーナーヘッダーのコンディション導線
 * 観点: 操作性 / CUJ
 *
 * 手順:
 * 1. トレーナーでログインする
 * 2. 画面上部のヘッダーを確認する
 *
 * 期待結果（表示）:
 * - ヘッダーに「コンディション」ナビゲーションが表示されていること
 */
test.describe('E-C02 トレーナーヘッダーのコンディション導線', () => {
  test('トレーナーログイン後_ヘッダーにコンディションナビゲーションが表示される', async ({
    page,
  }) => {
    await loginAsTrainer(page);

    await expect(trainerHeaderNav(page)).toBeVisible();
    await expectTrainerConditionNavLink(page);
  });
});

/**
 * E-C03: トレーナーによる新卒ステート確認
 * 観点: CUJ / 連携 / 操作性
 *
 * 手順:
 * 1. 新卒でログインし、コンディションを入力して送信する
 * 2. ログアウトし、トレーナーでログインする
 * 3. ヘッダーからコンディション画面を開く
 *
 * 期待結果（表示）:
 * - 画面上部に、対象新卒の現在のコンディション（業務量・理解度・メンタル）が表示されていること
 *
 * 期待結果（データ）:
 * - 新卒が送信した値が GET /api/condition/trainees/:traineeId/latest 経由で取得され表示される
 */
test.describe('E-C03 トレーナーによる新卒ステート確認', () => {
  test('新卒送信後トレーナーがコンディション画面を開く_画面上部に業務量理解度メンタルが表示される', async ({
    page,
  }) => {
    await loginAsTrainee(page);
    await openWeeklyConditionInput(page);
    await setConditionValues(page, E_C03_CONDITION_INPUT);
    await submitWeeklyCondition(page);

    await logout(page);
    await loginAsTrainer(page);
    await openTrainerConditionPage(page);
    await expectTrainerCurrentConditionValues(page, E_C03_CONDITION_INPUT);
  });
});

/**
 * E-C04: コンディション推移グラフの更新
 * 観点: CUJ / 連携 / 操作性
 *
 * 手順:
 * 1. 新卒でログインし、コンディションを入力して送信する
 * 2. トレーナーでログインし、コンディション画面を開く
 * 3. 新卒で再度コンディションを変更して送信する
 * 4. トレーナーでコンディション画面を再表示する
 *
 * 期待結果（表示）:
 * - 現在のコンディション表示の下に推移表が配置されていること
 * - 再表示時に推移表が最新入力を反映して更新されていること
 *
 * 期待結果（データ）:
 * - GET /api/condition/trainees/:traineeId/graph の rows が最新履歴を返し、画面に反映される
 */
test.describe('E-C04 コンディション推移グラフの更新', () => {
  test('新卒が2回送信_トレーナー再表示で推移表が最新入力に更新される', async ({
    page,
  }) => {
    await loginAsTrainee(page);
    await openWeeklyConditionInput(page);
    await setConditionValues(page, E_C04_FIRST_INPUT);
    await submitWeeklyCondition(page);

    await logout(page);
    await loginAsTrainer(page);
    await openTrainerConditionPageWithGraph(page);

    await expectTrainerCurrentConditionValues(page, E_C04_FIRST_INPUT);
    await expectConditionTransitionTableStructure(page);
    await expectConditionTransitionTableBelowCurrentCondition(page);
    await expectConditionTransitionTableLatestRow(page, E_C04_FIRST_INPUT);
    const tableRowCountAfterFirstView =
      await countConditionTransitionTableRows(page);

    await logout(page);
    await loginAsTrainee(page);
    await openWeeklyConditionInput(page);
    await setConditionValues(page, E_C04_SECOND_INPUT);
    await submitWeeklyCondition(page);

    await logout(page);
    await loginAsTrainer(page);
    await reopenTrainerConditionPageWithGraph(page);

    await expectTrainerCurrentConditionValues(page, E_C04_SECOND_INPUT);
    await expectConditionTransitionTableStructure(page);
    await expectConditionTransitionTableBelowCurrentCondition(page);
    await expect(conditionTransitionTableRows(page)).toHaveCount(
      tableRowCountAfterFirstView + 1,
    );
    await expectConditionTransitionTableLatestRow(page, E_C04_SECOND_INPUT);
  });
});

/**
 * E-C04: コンディション推移折れ線グラフの更新
 * 観点: CUJ / 連携 / 操作性
 *
 * 手順:
 * 1. 新卒でログインし、コンディションを入力して送信する
 * 2. トレーナーでログインし、コンディション画面を開く
 * 3. 新卒で再度コンディションを変更して送信する
 * 4. トレーナーでコンディション画面を再表示する
 *
 * 期待結果（表示）:
 * - 現在のコンディション表示の下に折れ線グラフが配置されていること
 * - 横軸に記録日時、3 系列（業務量・理解度・メンタル）が表示されていること
 * - 再表示時に折れ線グラフが最新入力を反映して更新されていること
 *
 * 期待結果（データ）:
 * - GET /api/condition/trainees/:traineeId/graph の lineChart が最新履歴を返し、画面に反映される
 */
test.describe('E-C04 コンディション推移折れ線グラフの更新', () => {
  test('新卒が2回送信_トレーナー再表示で折れ線グラフが最新入力に更新される', async ({
    page,
  }) => {
    await loginAsTrainee(page);
    await openWeeklyConditionInput(page);
    await setConditionValues(page, E_C04_FIRST_INPUT);
    await submitWeeklyCondition(page);

    await logout(page);
    await loginAsTrainer(page);
    await openTrainerConditionPageWithGraph(page);

    await expectTrainerCurrentConditionValues(page, E_C04_FIRST_INPUT);
    await expectConditionLineChartStructure(page);
    await expectConditionLineChartBelowCurrentCondition(page);
    const xAxisLabelCountAfterFirstView =
      await countConditionLineChartXAxisLabels(page);

    await logout(page);
    await loginAsTrainee(page);
    await openWeeklyConditionInput(page);
    await setConditionValues(page, E_C04_SECOND_INPUT);
    await submitWeeklyCondition(page);

    await logout(page);
    await loginAsTrainer(page);
    await reopenTrainerConditionPageWithGraph(page);

    await expectTrainerCurrentConditionValues(page, E_C04_SECOND_INPUT);
    await expectConditionLineChartStructure(page);
    await expectConditionLineChartBelowCurrentCondition(page);
    await expect(
      trainerConditionLineChartXAxisTicks(page).getByRole('listitem'),
    ).toHaveCount(xAxisLabelCountAfterFirstView + 1);
  });
});

/**
 * E-C05: コンディション画面での不安定アラート
 * 観点: CUJ / 連携 / 操作性
 *
 * 手順:
 * 1. 新卒でログインし、メンタルを「1」に設定してコンディションを送信する
 * 2. ログアウトし、トレーナーでログインする
 * 3. ヘッダーからコンディション画面を開く
 *
 * 期待結果（表示）:
 * - コンディション画面上にアラート「新卒が不安定です。」が表示されていること
 *
 * 期待結果（データ）:
 * - POST /api/condition が成功し、GET /api/condition/trainees/:traineeId/page-alert が
 *   hasAlert: true とメッセージを返し、画面に反映される
 */
test.describe('E-C05 コンディション画面での不安定アラート', () => {
  test('新卒メンタル1送信後_トレーナーがコンディション画面を開く_不安定アラートが表示される', async ({
    page,
  }) => {
    await loginAsTrainee(page);
    await openWeeklyConditionInput(page);
    await setMentalValue(page, E_C01_MENTAL_VALUE);
    await submitWeeklyCondition(page);

    await logout(page);
    await loginAsTrainer(page);
    await openTrainerConditionPageWithPageAlert(page);
    await expectConditionPageUnstableAlert(page);
  });
});

/**
 * E-C06: 折れ線グラフの軸・目盛表示
 * 観点: 操作性 / 連携 / CUJ
 *
 * 手順:
 * 1. 新卒でログインし、コンディションを 2 回以上（異なる日付または再入力）送信する
 * 2. トレーナーでログインし、コンディション画面を開く
 * 3. 折れ線グラフ領域を確認する
 *
 * 期待結果（表示）:
 * - 縦軸に 1・2・3・4・5、横軸に各記録の日付が表示される
 * - 目盛に対応する縦横の補助線（グリッド）が表示される
 * - 折れ線グラフの下に 1〜5、日付の箇条書き、系列ごとの数値リストが表示されない
 *
 * 期待結果（データ）:
 * - GET /api/condition/trainees/:traineeId/graph の lineChart.yAxisTicks / xAxisTicks /
 *   supplementalDisplay が画面の軸・目盛・非表示契約と一致する
 */
test.describe('E-C06 折れ線グラフの軸・目盛表示', () => {
  test('新卒が2回送信_トレーナーが折れ線グラフの軸目盛とグリッドを確認できる', async ({
    page,
  }) => {
    await loginAsTrainee(page);
    await openWeeklyConditionInput(page);
    await setConditionValues(page, E_C06_FIRST_INPUT);
    await submitWeeklyCondition(page);
    await setConditionValues(page, E_C06_SECOND_INPUT);
    await submitWeeklyCondition(page);

    await logout(page);
    await loginAsTrainer(page);

    const lineChart = await openTrainerConditionPageWithGraphData(page);

    expect(lineChart.xAxisLabels.length).toBeGreaterThanOrEqual(2);
    expect(lineChart.supplementalDisplay).toEqual({
      showYAxisRangeText: false,
      showDateList: false,
      showSeriesValueLists: false,
    });

    await expectTrainerCurrentConditionValues(page, E_C06_SECOND_INPUT);
    await expectConditionLineChartBelowCurrentCondition(page);
    await expectConditionLineChartAxisAndGrid(page, lineChart);
    await expectConditionLineChartSupplementalTextHidden(page);
  });
});

/**
 * E-C07: コンディション推移表の表示
 * 観点: CUJ / 連携 / 操作性
 *
 * 手順:
 * 1. 新卒でログインし、コンディションを 2 回以上送信する
 *    （例: 1 回目 業務量=4・理解度=3・メンタル=3、2 回目 業務量=4・理解度=3・メンタル=1）
 * 2. トレーナーでログインし、コンディション画面を開く
 * 3. 折れ線グラフ下の表を確認する
 *
 * 期待結果（表示）:
 * - 記録日時・業務量・理解度・メンタルを列とする表が表示されていること
 * - 折れ線グラフの直下に表が配置されていること
 * - 各行の値が送信した履歴と一致すること
 * - 同一日付の再入力は別行として表示されること
 *
 * 期待結果（データ）:
 * - GET /api/condition/trainees/:traineeId/graph の transitionTable が
 *   列定義・行データを返し、画面の表と一致する
 */
test.describe('E-C07 コンディション推移表の表示', () => {
  test('新卒が同一日内に2回送信_トレーナーが推移表の列と履歴行を確認できる', async ({
    page,
  }) => {
    await loginAsTrainee(page);
    await openWeeklyConditionInput(page);
    await setConditionValues(page, E_C07_FIRST_INPUT);
    await submitWeeklyCondition(page);
    await setConditionValues(page, E_C07_SECOND_INPUT);
    await submitWeeklyCondition(page);

    await logout(page);
    await loginAsTrainer(page);

    const { transitionTable } =
      await openTrainerConditionPageWithGraphAndTransitionTable(page);

    expect(transitionTable.columns.map((column) => column.label)).toEqual([
      ...E_C07_TRANSITION_TABLE_COLUMN_LABELS,
    ]);

    const submittedRows = transitionTable.rows.slice(-2);
    expect(submittedRows).toHaveLength(2);
    expect(submittedRows[0]).toMatchObject(E_C07_FIRST_INPUT);
    expect(submittedRows[1]).toMatchObject(E_C07_SECOND_INPUT);
    expect(submittedRows[0].recordedAt).toBe(submittedRows[1].recordedAt);

    await expectTrainerCurrentConditionValues(page, E_C07_SECOND_INPUT);
    await expectConditionTransitionTableStructure(page);
    await expectConditionTransitionTableBelowLineChart(page);
    await expectConditionTransitionTableColumnsFromApi(page, transitionTable);
    await expectConditionTransitionTableRowsMatchApi(page, transitionTable);
    await expect(conditionTransitionTableRows(page)).toHaveCount(
      transitionTable.rows.length,
    );
  });
});

/**
 * E-C12: 折れ線グラフの横軸ラベルの縦位置揃え
 * 観点: 操作性 / 連携 / CUJ
 *
 * 手順:
 * 1. 新卒でログインし、コンディションを 2 回以上（同一日付の再入力を含む）送信する
 * 2. トレーナーでログインし、コンディション画面を開く
 * 3. 横軸の日付ラベルが横軸基準線上に揃っているか確認する
 *
 * 期待結果（表示）:
 * - すべての横軸日付ラベルが、プロット領域下端の横軸基準線の高さに揃って表示されていること
 * - ラベルが基準線から上下にずれて見えないこと
 *
 * 期待結果（データ）:
 * - GET /api/condition/trainees/:traineeId/graph の lineChart.xAxisAlignment が
 *   labelBaseline: bottom と同一 baselineY を返すこと
 * - lineChart.xAxisTicks の y 座標が xAxisAlignment と一致すること
 */
test.describe('E-C12 折れ線グラフの横軸ラベルの縦位置揃え', () => {
  test('新卒が同一日内に2回送信_トレーナーが横軸日付ラベルの縦位置揃えを確認できる', async ({
    page,
  }) => {
    await loginAsTrainee(page);
    await openWeeklyConditionInput(page);
    await setConditionValues(page, E_C12_FIRST_INPUT);
    await submitWeeklyCondition(page);
    await setConditionValues(page, E_C12_SECOND_INPUT);
    await submitWeeklyCondition(page);

    await logout(page);
    await loginAsTrainer(page);

    const lineChart = await openTrainerConditionPageWithGraphData(page);

    const submittedLabels = lineChart.xAxisLabels.slice(-2);
    expect(submittedLabels).toHaveLength(2);
    expect(submittedLabels[0]).toBe(submittedLabels[1]);

    await expectTrainerCurrentConditionValues(page, E_C12_SECOND_INPUT);
    await expectConditionLineChartStructure(page);
    await expectConditionLineChartBelowCurrentCondition(page);
    await expectConditionLineChartXAxisLabelVerticalAlignment(page, lineChart);
  });
});

/**
 * E-C13: コンディション推移表の罫線付きグリッド表示
 * 観点: 操作性 / 連携 / CUJ
 *
 * 手順:
 * 1. 新卒でログインし、コンディションを 2 回以上送信する
 * 2. トレーナーでログインし、コンディション画面を開く
 * 3. 折れ線グラフ下の推移表の罫線を確認する
 *
 * 期待結果（表示）:
 * - 記録日時・業務量・理解度・メンタルの各セルが罫線で区切られていること
 * - セルごとに値が識別できること
 * - 各行の値が送信した履歴と一致すること
 *
 * 期待結果（データ）:
 * - GET /api/condition/trainees/:traineeId/graph の transitionTable.cellBorderLayout が
 *   grid 契約（列見出し・データセルそれぞれに上下左右の境界線）を返すこと
 */
test.describe('E-C13 コンディション推移表の罫線付きグリッド表示', () => {
  test('新卒が同一日内に2回送信_トレーナーが推移表の罫線付きグリッドを確認できる', async ({
    page,
  }) => {
    await loginAsTrainee(page);
    await openWeeklyConditionInput(page);
    await setConditionValues(page, E_C13_FIRST_INPUT);
    await submitWeeklyCondition(page);
    await setConditionValues(page, E_C13_SECOND_INPUT);
    await submitWeeklyCondition(page);

    await logout(page);
    await loginAsTrainer(page);

    const { transitionTable } =
      await openTrainerConditionPageWithGraphAndTransitionTable(page);

    const submittedRows = transitionTable.rows.slice(-2);
    expect(submittedRows).toHaveLength(2);
    expect(submittedRows[0]).toMatchObject(E_C13_FIRST_INPUT);
    expect(submittedRows[1]).toMatchObject(E_C13_SECOND_INPUT);
    expect(submittedRows[0].recordedAt).toBe(submittedRows[1].recordedAt);

    await expectTrainerCurrentConditionValues(page, E_C13_SECOND_INPUT);
    await expectConditionTransitionTableBorderedGrid(page, transitionTable);
    await expect(conditionTransitionTableRows(page)).toHaveCount(
      transitionTable.rows.length,
    );
  });
});
