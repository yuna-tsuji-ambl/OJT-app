import { test, expect, type Page } from '@playwright/test';

const CONDITION_SUBMIT_MESSAGE = '記録しました';
const CONDITION_ALERT_MESSAGE = '要フォロー';
const TRAINEE_ID = 'trainee-1';

async function loginAsTrainee(page: Page): Promise<void> {
  await page.goto('/login');
  await page.getByRole('button', { name: '新卒としてログイン' }).click();
}

async function loginAsTrainer(page: Page): Promise<void> {
  await page.goto('/login');
  await page.getByRole('button', { name: 'トレーナーとしてログイン' }).click();
}

async function openWeeklyConditionInput(page: Page): Promise<void> {
  await page.getByRole('link', { name: '週次入力' }).click();
  await expect(
    page.getByRole('heading', { name: '週次コンディション入力' }),
  ).toBeVisible();
}

async function setMentalValue(page: Page, value: number): Promise<void> {
  await page.getByRole('slider', { name: 'メンタル' }).fill(String(value));
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

async function openTrainerDashboard(page: Page): Promise<void> {
  await page.getByRole('link', { name: 'ダッシュボード' }).click();
  await expect(
    page.getByRole('heading', { name: 'ダッシュボード' }),
  ).toBeVisible();
}

async function openTraineeDetail(page: Page, traineeId: string): Promise<void> {
  await page.getByRole('link', { name: `新卒 ${traineeId} の詳細` }).click();
  await expect(
    page.getByRole('heading', { name: `新卒 ${traineeId} の詳細` }),
  ).toBeVisible();
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
 * 期待結果:
 * - ダッシュボード上で該当新卒のアラート通知が表示される
 * - 詳細画面で「メンタル=1」の記録が確認できる
 */
test.describe('E-C01 温度計入力からアラート確認のEnd-to-End', () => {
  test('新卒入力からトレーナー確認_アラートと記録が表示される', async ({
    page,
  }) => {
    await loginAsTrainee(page);
    await openWeeklyConditionInput(page);
    await setMentalValue(page, 1);
    await submitWeeklyCondition(page);

    await page.getByRole('button', { name: 'ログアウト' }).click();
    await loginAsTrainer(page);
    await openTrainerDashboard(page);

    await expect(page.getByText(CONDITION_ALERT_MESSAGE)).toBeVisible();

    await openTraineeDetail(page, TRAINEE_ID);
    await expect(
      page.getByRole('term').filter({ hasText: 'メンタル' }).locator('+ dd'),
    ).toHaveText('1');
  });
});
