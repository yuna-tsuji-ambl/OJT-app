import { test, expect, type Page } from '@playwright/test';

const QUEST_A_NAME = 'クエストA';
const QUEST_CLEARED_LABEL = 'クリア（承認済み）';
const NEW_QUEST_NAME = '新規クエスト';
const QUEST_MAJOR_ITEM = '開発基礎';
const QUEST_ACHIEVEMENT_LEVEL = 'Lv1';
const QUEST_NOT_CLEARED_STATUS = '未クリア';

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

function questCreateRegion(page: Page) {
  return page.getByRole('region', { name: 'クエスト作成' });
}

async function createQuestOnDashboard(page: Page): Promise<void> {
  const createResponse = page.waitForResponse(
    (response) =>
      /\/api\/quests\/?$/.test(new URL(response.url()).pathname) &&
      response.request().method() === 'POST' &&
      response.ok(),
  );

  const createRegion = questCreateRegion(page);
  await createRegion.getByLabel('大項目').fill(QUEST_MAJOR_ITEM);
  await createRegion.getByLabel('小項目').fill(NEW_QUEST_NAME);
  await createRegion.getByLabel('到達レベル').fill(QUEST_ACHIEVEMENT_LEVEL);
  await createRegion.getByRole('button', { name: '作成' }).click();

  await createResponse;
}

async function expectTrainerQuestProgress(
  page: Page,
  questName: string,
  status: string,
): Promise<void> {
  await expect(questArticle(page, questName)).toBeVisible();
  await expect(questArticle(page, questName).getByText(status)).toBeVisible();
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

/**
 * E-Q02: クエスト作成から新卒側反映までのEnd-to-End
 * 観点: CUJ / 連携 / 操作性
 *
 * 手順:
 * 1. トレーナーでログインし、ダッシュボードを開く
 * 2. 画面上部のクエスト作成機能で新しいクエストを追加する
 * 3. トレーナー画面で当該クエストの進捗状況が確認できることを確認する
 * 4. ログアウトし、新卒でログインし、クエスト一覧画面を開く
 *
 * 期待結果（表示）:
 * - 作成したクエストが新卒側のクエスト一覧にも表示されていること
 *
 * 期待結果（データ）:
 * - クエスト作成 API が成功し、トレーナー・新卒の両画面で同一クエストが確認できる
 */
test.describe('E-Q02 クエスト作成から新卒側反映までのEnd-to-End', () => {
  test('トレーナー作成から新卒確認_新規クエストが一覧に表示される', async ({
    page,
  }) => {
    await loginAsTrainer(page);
    await openTrainerDashboard(page);
    await expect(questCreateRegion(page)).toBeVisible();
    await createQuestOnDashboard(page);
    await expectTrainerQuestProgress(
      page,
      NEW_QUEST_NAME,
      QUEST_NOT_CLEARED_STATUS,
    );

    await logout(page);
    await loginAsTrainee(page);
    await openQuestList(page);
    await expect(questArticle(page, NEW_QUEST_NAME)).toBeVisible();
    await expect(questArticle(page, NEW_QUEST_NAME)).toContainText(
      QUEST_MAJOR_ITEM,
    );
    await expect(questArticle(page, NEW_QUEST_NAME)).toContainText(
      QUEST_ACHIEVEMENT_LEVEL,
    );
  });
});
