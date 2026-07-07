import { test, expect, type Page } from '@playwright/test';

// コンディション E2E は同一 API の InMemory ストアを共有するため、並列実行しない
test.describe.configure({ mode: 'serial' });

const CONDITION_SUBMIT_MESSAGE = '記録しました';
const CONDITION_ALERT_MESSAGE = '要フォロー';
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

type ConditionSliderLabel = '業務量' | '理解度' | 'メンタル';

type ConditionValues = {
  workload: number;
  comprehension: number;
  mental: number;
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

function trainerConditionGraphRegion(page: Page) {
  return page.getByRole('region', { name: 'コンディション推移グラフ' });
}

function conditionGraphDataRows(page: Page) {
  return trainerConditionGraphRegion(page).locator('tbody tr');
}

async function expectConditionGraphBelowCurrentCondition(
  page: Page,
): Promise<void> {
  const currentRegion = trainerCurrentConditionRegion(page);
  const graphRegion = trainerConditionGraphRegion(page);

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

async function expectConditionGraphLatestRow(
  page: Page,
  values: ConditionValues,
): Promise<void> {
  const latestRow = conditionGraphDataRows(page).last();

  await expect(latestRow).toContainText(String(values.workload));
  await expect(latestRow).toContainText(String(values.comprehension));
  await expect(latestRow).toContainText(String(values.mental));
}

async function countConditionGraphDataRows(page: Page): Promise<number> {
  return conditionGraphDataRows(page).count();
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
 * - 現在のコンディション表示の下に推移グラフが配置されていること
 * - 再表示時にグラフが最新入力を反映して更新されていること
 *
 * 期待結果（データ）:
 * - GET /api/condition/trainees/:traineeId/graph が最新履歴を返し、画面に反映される
 */
test.describe('E-C04 コンディション推移グラフの更新', () => {
  test('新卒が2回送信_トレーナー再表示で推移グラフが最新入力に更新される', async ({
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
    await expectConditionGraphBelowCurrentCondition(page);
    await expectConditionGraphLatestRow(page, E_C04_FIRST_INPUT);
    const graphRowCountAfterFirstView = await countConditionGraphDataRows(page);

    await logout(page);
    await loginAsTrainee(page);
    await openWeeklyConditionInput(page);
    await setConditionValues(page, E_C04_SECOND_INPUT);
    await submitWeeklyCondition(page);

    await logout(page);
    await loginAsTrainer(page);
    await reopenTrainerConditionPageWithGraph(page);

    await expectTrainerCurrentConditionValues(page, E_C04_SECOND_INPUT);
    await expectConditionGraphBelowCurrentCondition(page);
    await expect(conditionGraphDataRows(page)).toHaveCount(
      graphRowCountAfterFirstView + 1,
    );
    await expectConditionGraphLatestRow(page, E_C04_SECOND_INPUT);
  });
});
