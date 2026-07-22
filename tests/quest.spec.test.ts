import { test, expect, type Page } from '@playwright/test';

const QUEST_A_NAME = 'クエストA';
const QUEST_CLEARED_LABEL = 'クリア（承認済み）';
const NEW_QUEST_NAME = '新規クエスト';
const E_Q03_QUEST_NAME = 'E-Q03新規クエスト';
const E_Q05_QUEST_NAME = 'E-Q05新規クエスト';
const E_Q05_SELECTED_ACHIEVEMENT_LEVEL = '3';
const E_Q05_DISPLAY_ACHIEVEMENT_LEVEL = 'Lv3';
const E_Q06_QUEST_NAME = 'E-Q06新規クエスト';
const E_Q06_TITLE = 'E-Q06タイトル';
const E_Q06_SELECTED_ACHIEVEMENT_LEVEL = '2';
const E_Q06_DISPLAY_ACHIEVEMENT_LEVEL = 'Lv2';
const QUEST_MAJOR_ITEM = '開発基礎';
const QUEST_ACHIEVEMENT_LEVEL = 'Lv1';
const QUEST_NOT_CLEARED_STATUS = '未クリア';
const QUEST_PENDING_STATUS = '申請中';

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
  await page.getByRole('link', { name: '課題一覧' }).click();
  await expect(page.getByRole('heading', { name: '課題一覧' })).toBeVisible();
}

function questArticle(page: Page, questName: string) {
  return page.getByRole('article', { name: questName, exact: true });
}

async function requestQuestClear(page: Page, questName: string): Promise<void> {
  const requestResponse = page.waitForResponse(
    (response) =>
      response.url().includes('/api/assignments') &&
      response.request().method() === 'POST' &&
      response.url().includes('/request') &&
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

async function openAssignmentManage(page: Page): Promise<void> {
  await page.getByRole('link', { name: '課題管理' }).click();
  await expect(page.getByRole('heading', { name: '課題管理' })).toBeVisible();
}

async function approveQuest(page: Page, questName: string): Promise<void> {
  const approveResponse = page.waitForResponse(
    (response) =>
      response.url().includes('/api/assignments') &&
      response.request().method() === 'POST' &&
      response.url().includes('/approve') &&
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
  return page.getByRole('region', { name: '課題作成' });
}

const QUEST_CREATE_FIELD_LABELS = [
  '大項目',
  'タイトル',
  '説明',
  '到達レベル',
] as const;

async function expectFieldsStackedVertically(
  container: ReturnType<typeof questCreateRegion>,
  labels: readonly string[],
): Promise<void> {
  const boxes = await Promise.all(
    labels.map(async (label) => {
      const box = await container.getByLabel(label).boundingBox();
      expect(box).not.toBeNull();
      return box!;
    }),
  );

  for (let index = 0; index < boxes.length - 1; index += 1) {
    expect(boxes[index + 1].y).toBeGreaterThan(boxes[index].y);
  }
}

async function expectQuestCreateFormDesign(page: Page): Promise<void> {
  const createRegion = questCreateRegion(page);

  for (const label of QUEST_CREATE_FIELD_LABELS) {
    await expect(createRegion.getByLabel(label)).toBeVisible();
  }

  await expectFieldsStackedVertically(createRegion, QUEST_CREATE_FIELD_LABELS);

  const createFormActions = createRegion.locator('form .btn-group');
  await expect(createFormActions).toBeVisible();
  await expect(
    createFormActions.getByRole('button', { name: '作成' }),
  ).toHaveClass(/btn-primary/);
}

async function createQuestOnManage(
  page: Page,
  title: string = NEW_QUEST_NAME,
): Promise<void> {
  const createResponse = page.waitForResponse(
    (response) =>
      /\/api\/assignments\/?$/.test(new URL(response.url()).pathname) &&
      response.request().method() === 'POST' &&
      response.ok(),
  );

  const createRegion = questCreateRegion(page);
  await createRegion.getByLabel('大項目').fill(QUEST_MAJOR_ITEM);
  await createRegion.getByLabel('タイトル').fill(title);
  await createRegion.getByLabel('説明').fill('テスト説明');
  await questAchievementLevelField(page).selectOption('1');
  await createRegion.getByRole('button', { name: '作成' }).click();

  await createResponse;
}

function questAchievementLevelField(page: Page) {
  return questCreateRegion(page).getByLabel('到達レベル');
}

async function expectQuestAchievementLevelDropdown(page: Page): Promise<void> {
  await expect(questAchievementLevelField(page)).toHaveRole('combobox');
}

async function createQuestWithAchievementLevel(
  page: Page,
  title: string,
  achievementLevel: string,
  majorItem: string = QUEST_MAJOR_ITEM,
): Promise<void> {
  const createResponse = page.waitForResponse(
    (response) =>
      /\/api\/assignments\/?$/.test(new URL(response.url()).pathname) &&
      response.request().method() === 'POST' &&
      response.ok(),
  );

  const createRegion = questCreateRegion(page);
  await createRegion.getByLabel('大項目').fill(majorItem);
  await createRegion.getByLabel('タイトル').fill(title);
  await createRegion.getByLabel('説明').fill('テスト説明');
  await questAchievementLevelField(page).selectOption(achievementLevel);
  await createRegion.getByRole('button', { name: '作成' }).click();

  await createResponse;
}

async function expectTraineeQuestAchievementLevel(
  page: Page,
  questName: string,
  achievementLevel: string,
): Promise<void> {
  await expect(questArticle(page, questName)).toBeVisible();
  await expect(questArticle(page, questName)).toContainText(achievementLevel);
}

async function expectTraineeQuestStatus(
  page: Page,
  questName: string,
  status: string,
): Promise<void> {
  await expect(questArticle(page, questName)).toBeVisible();
  await expect(questArticle(page, questName).getByText(status)).toBeVisible();
}

async function expectTrainerPendingQuestWithApprove(
  page: Page,
  questName: string,
): Promise<void> {
  const quest = questArticle(page, questName);
  await expect(quest).toBeVisible();
  await expect(quest.getByRole('button', { name: '承認' })).toBeVisible();
}

async function expectTrainerQuestProgress(
  page: Page,
  questName: string,
  status: string,
): Promise<void> {
  await expect(questArticle(page, questName)).toBeVisible();
  await expect(questArticle(page, questName).getByText(status)).toBeVisible();
}

async function expectTrainerQuestProgressDisplay(
  page: Page,
  questName: string,
  display: {
    title: string;
    comment: string;
    achievementLevel: string;
  },
): Promise<void> {
  const quest = questArticle(page, questName);
  await expect(quest).toBeVisible();
  await expect(quest).toContainText(display.title);
  await expect(quest).toContainText(display.comment);
  await expect(quest).toContainText(display.achievementLevel);
}

test.describe('E-Q01 クエスト申請から承認までのEnd-to-End', () => {
  test('新卒申請からトレーナー承認_クエストAにクリア表示される', async ({
    page,
  }) => {
    await loginAsTrainee(page);
    await openQuestList(page);
    await expect(questArticle(page, QUEST_A_NAME)).toBeVisible();
    await requestQuestClear(page, QUEST_A_NAME);

    await logout(page);
    await loginAsTrainer(page);
    await openTrainerDashboard(page);
    await expect(
      questArticle(page, QUEST_A_NAME).getByRole('button', { name: '承認' }),
    ).toBeVisible();
    await approveQuest(page, QUEST_A_NAME);

    await logout(page);
    await loginAsTrainee(page);
    await openQuestList(page);
    await expectQuestCleared(page, QUEST_A_NAME);
  });
});

test.describe('E-Q02 クエスト作成から新卒側反映までのEnd-to-End', () => {
  test('トレーナー作成から新卒確認_新規クエストが一覧に表示される', async ({
    page,
  }) => {
    await loginAsTrainer(page);
    await openAssignmentManage(page);
    await expect(questCreateRegion(page)).toBeVisible();
    await createQuestOnManage(page);
    await openTrainerDashboard(page);
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

test.describe('E-Q03 作成クエストの申請から承認までのEnd-to-End', () => {
  test('トレーナー作成から申請承認_双方一覧に反映され新卒でクリア表示される', async ({
    page,
  }) => {
    await loginAsTrainer(page);
    await openAssignmentManage(page);
    await createQuestOnManage(page, E_Q03_QUEST_NAME);
    await openTrainerDashboard(page);
    await expectTrainerQuestProgress(
      page,
      E_Q03_QUEST_NAME,
      QUEST_NOT_CLEARED_STATUS,
    );

    await logout(page);
    await loginAsTrainee(page);
    await openQuestList(page);
    await expect(questArticle(page, E_Q03_QUEST_NAME)).toBeVisible();
    await requestQuestClear(page, E_Q03_QUEST_NAME);
    await expectTraineeQuestStatus(
      page,
      E_Q03_QUEST_NAME,
      QUEST_PENDING_STATUS,
    );

    await logout(page);
    await loginAsTrainer(page);
    await openTrainerDashboard(page);
    await expectTrainerPendingQuestWithApprove(page, E_Q03_QUEST_NAME);
    await expectTrainerQuestProgress(
      page,
      E_Q03_QUEST_NAME,
      QUEST_PENDING_STATUS,
    );
    await approveQuest(page, E_Q03_QUEST_NAME);

    await logout(page);
    await loginAsTrainee(page);
    await openQuestList(page);
    await expect(questArticle(page, E_Q03_QUEST_NAME)).toBeVisible();
    await expectQuestCleared(page, E_Q03_QUEST_NAME);

    await logout(page);
    await loginAsTrainer(page);
    await openTrainerDashboard(page);
    await expectTrainerQuestProgress(
      page,
      E_Q03_QUEST_NAME,
      QUEST_CLEARED_LABEL,
    );
  });
});

test.describe('E-Q04 クエスト作成フォームのデザイン', () => {
  test('トレーナー課題管理_作成フォームが縦並びで表示される', async ({
    page,
  }) => {
    await loginAsTrainer(page);
    await openAssignmentManage(page);
    await expect(questCreateRegion(page)).toBeVisible();
    await expectQuestCreateFormDesign(page);
  });
});

test.describe('E-Q05 到達レベルドロップダウンとLv表示', () => {
  test('トレーナーが到達レベル3を選択_新卒一覧にLv3が表示される', async ({
    page,
  }) => {
    await loginAsTrainer(page);
    await openAssignmentManage(page);
    await expectQuestAchievementLevelDropdown(page);
    await createQuestWithAchievementLevel(
      page,
      E_Q05_QUEST_NAME,
      E_Q05_SELECTED_ACHIEVEMENT_LEVEL,
    );

    await logout(page);
    await loginAsTrainee(page);
    await openQuestList(page);
    await expect(questArticle(page, E_Q05_QUEST_NAME)).toBeVisible();
    await expectTraineeQuestAchievementLevel(
      page,
      E_Q05_QUEST_NAME,
      E_Q05_DISPLAY_ACHIEVEMENT_LEVEL,
    );
  });
});

test.describe('E-Q06 トレーナー画面でのタイトル表示', () => {
  test('トレーナー作成後_進捗一覧にタイトルコメント到達レベルが表示される', async ({
    page,
  }) => {
    await loginAsTrainer(page);
    await openAssignmentManage(page);
    await createQuestWithAchievementLevel(
      page,
      E_Q06_QUEST_NAME,
      E_Q06_SELECTED_ACHIEVEMENT_LEVEL,
      E_Q06_TITLE,
    );
    await openTrainerDashboard(page);
    await expectTrainerQuestProgressDisplay(page, E_Q06_QUEST_NAME, {
      title: E_Q06_TITLE,
      comment: E_Q06_QUEST_NAME,
      achievementLevel: E_Q06_DISPLAY_ACHIEVEMENT_LEVEL,
    });
  });
});
