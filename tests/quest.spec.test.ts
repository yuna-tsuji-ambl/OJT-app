import { test, expect, type Page } from '@playwright/test';

const QUEST_A_NAME = 'クエストA';
const QUEST_CLEARED_LABEL = 'クリア（承認済み）';

async function loginAsTrainee(page: Page): Promise<void> {
  await page.goto('/login');
  await page.getByRole('button', { name: '新卒としてログイン' }).click();
}

async function loginAsTrainer(page: Page): Promise<void> {
  await page.goto('/login');
  await page.getByRole('button', { name: 'トレーナーとしてログイン' }).click();
}

async function logout(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'ログアウト' }).click();
  await expect(page.getByRole('heading', { name: 'ログイン' })).toBeVisible();
}

async function openQuestList(page: Page): Promise<void> {
  await page.getByRole('link', { name: 'クエスト一覧' }).click();
  await expect(
    page.getByRole('heading', { name: 'クエスト一覧' }),
  ).toBeVisible();
}

function questArticle(page: Page, questName: string) {
  return page.getByRole('article', { name: questName });
}

async function requestQuestClear(page: Page, questName: string): Promise<void> {
  const requestResponse = page.waitForResponse(
    (response) =>
      response.url().includes('/api/quests') &&
      response.request().method() === 'POST' &&
      response.ok(),
  );

  await questArticle(page, questName)
    .getByRole('button', { name: '申請' })
    .click();

  await requestResponse;
}

async function openTrainerDashboard(page: Page): Promise<void> {
  await page.getByRole('link', { name: 'ダッシュボード' }).click();
  await expect(
    page.getByRole('heading', { name: 'ダッシュボード' }),
  ).toBeVisible();
}

async function approveQuest(page: Page, questName: string): Promise<void> {
  const approveResponse = page.waitForResponse(
    (response) =>
      response.url().includes('/api/quests') &&
      response.request().method() === 'POST' &&
      response.ok(),
  );

  await questArticle(page, questName)
    .getByRole('button', { name: '承認' })
    .click();

  await approveResponse;
}

async function expectQuestCleared(
  page: Page,
  questName: string,
): Promise<void> {
  await expect(
    questArticle(page, questName).getByText(QUEST_CLEARED_LABEL),
  ).toBeVisible();
}

/**
 * E-Q01: クエスト申請から承認までのEnd-to-End
 * 観点: CUJ / 連携 / 操作性
 *
 * 手順:
 * 1. 新卒でログインし、クエスト一覧画面へ遷移
 * 2. クエストAの「申請」ボタンをクリック
 * 3. ログアウトし、トレーナーでログイン
 * 4. ダッシュボードからクエストAの「承認」ボタンをクリック
 * 5. ログアウトし、再度新卒でログイン
 *
 * 期待結果（表示）:
 * - 新卒のクエスト一覧画面で、クエストAに「クリア（承認済み）」が表示される
 *
 * 期待結果（データ）:
 * - 申請・承認の API が成功し、再ログイン後も承認状態が維持される
 */
test.describe('E-Q01 クエスト申請から承認までのEnd-to-End', () => {
  test('新卒申請からトレーナー承認_クエストAにクリア表示される', async ({
    page,
  }) => {
    await loginAsTrainee(page);
    await openQuestList(page);
    await requestQuestClear(page, QUEST_A_NAME);

    await logout(page);
    await loginAsTrainer(page);
    await openTrainerDashboard(page);
    await approveQuest(page, QUEST_A_NAME);

    await logout(page);
    await loginAsTrainee(page);
    await openQuestList(page);
    await expectQuestCleared(page, QUEST_A_NAME);
  });
});
