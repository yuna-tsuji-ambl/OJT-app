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
  await page.getByRole('link', { name: 'クエスト一覧' }).click();
  await expect(
    page.getByRole('heading', { name: 'クエスト一覧' }),
  ).toBeVisible();
}

function questArticle(page: Page, questName: string) {
  return page.getByRole('article', { name: questName, exact: true });
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

const QUEST_CREATE_FIELD_LABELS = [
  'タイトル',
  'コメント',
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

async function createQuestOnDashboard(
  page: Page,
  minorItem: string = NEW_QUEST_NAME,
): Promise<void> {
  const createResponse = page.waitForResponse(
    (response) =>
      /\/api\/quests\/?$/.test(new URL(response.url()).pathname) &&
      response.request().method() === 'POST' &&
      response.ok(),
  );

  const createRegion = questCreateRegion(page);
  await createRegion.getByLabel('タイトル').fill(QUEST_MAJOR_ITEM);
  await createRegion.getByLabel('コメント').fill(minorItem);
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
  comment: string,
  achievementLevel: string,
  title: string = QUEST_MAJOR_ITEM,
): Promise<void> {
  const createResponse = page.waitForResponse(
    (response) =>
      /\/api\/quests\/?$/.test(new URL(response.url()).pathname) &&
      response.request().method() === 'POST' &&
      response.ok(),
  );

  const createRegion = questCreateRegion(page);
  await createRegion.getByLabel('タイトル').fill(title);
  await createRegion.getByLabel('コメント').fill(comment);
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

/**
 * E-Q03: 作成クエストの申請から承認までのEnd-to-End
 * 観点: CUJ / 連携 / 操作性
 *
 * 手順:
 * 1. トレーナーでログインし、ダッシュボードを開く
 * 2. 画面上部のクエスト作成機能で新しいクエストを追加する
 * 3. ログアウトし、新卒でログインし、クエスト一覧画面を開く
 * 4. 作成したクエストの「申請」ボタンをクリック
 * 5. ログアウトし、トレーナーでログインし、ダッシュボードを開く
 * 6. 申請中の作成クエストが表示されていることを確認し、「承認」ボタンをクリック
 * 7. ログアウトし、新卒でログインし、クエスト一覧画面を開く
 *
 * 期待結果（表示）:
 * - 申請後・承認後ともに、作成クエストがトレーナー・新卒の双方の一覧に表示されていること
 * - 承認後は新卒のクエスト一覧で「クリア（承認済み）」が表示されていること
 *
 * 期待結果（データ）:
 * - 作成・申請・承認の各 API が成功し、再ログイン後も状態が双方の一覧に反映される
 */
test.describe('E-Q03 作成クエストの申請から承認までのEnd-to-End', () => {
  test('トレーナー作成から申請承認_双方一覧に反映され新卒でクリア表示される', async ({
    page,
  }) => {
    await loginAsTrainer(page);
    await openTrainerDashboard(page);
    await expect(questCreateRegion(page)).toBeVisible();
    await createQuestOnDashboard(page, E_Q03_QUEST_NAME);
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

/**
 * E-Q04: クエスト作成フォームのデザイン
 * 観点: 操作性 / CUJ
 *
 * 手順:
 * 1. トレーナーでログインし、ダッシュボードを開く
 * 2. 画面上部のクエスト作成領域を確認する
 *
 * 期待結果（表示）:
 * - 各入力項目が縦並びで配置されていること
 * - ラベルが「タイトル」「コメント」「到達レベル」であること
 * - 入力領域のデザインが新卒ホーム画面の送信部分と同様のスタイルであること
 */
test.describe('E-Q04 クエスト作成フォームのデザイン', () => {
  test('トレーナーダッシュボード_クエスト作成フォームが縦並びかつホーム送信部と同様のデザインである', async ({
    page,
  }) => {
    await loginAsTrainer(page);
    await openTrainerDashboard(page);
    await expect(questCreateRegion(page)).toBeVisible();
    await expectQuestCreateFormDesign(page);
  });
});

/**
 * E-Q05: 到達レベルドロップダウンとLv表示
 * 観点: CUJ / 連携 / 操作性
 *
 * 手順:
 * 1. トレーナーでログインし、ダッシュボードを開く
 * 2. タイトル・コメントを入力し、到達レベルをドロップダウンで数値選択してクエストを作成する
 * 3. ログアウトし、新卒でログインし、クエスト一覧画面を開く
 *
 * 期待結果（表示）:
 * - 到達レベルがドロップダウンで選択できること
 * - 作成したクエストの到達レベルが「Lv〇」形式（例: 数値3を選択した場合は「Lv3」）で表示されること
 *
 * 期待結果（データ）:
 * - クエスト作成 API が成功し、選択した到達レベルが新卒一覧に反映される
 */
test.describe('E-Q05 到達レベルドロップダウンとLv表示', () => {
  test('トレーナーが到達レベル3を選択_新卒一覧にLv3が表示される', async ({
    page,
  }) => {
    await loginAsTrainer(page);
    await openTrainerDashboard(page);
    await expect(questCreateRegion(page)).toBeVisible();
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

/**
 * E-Q06: トレーナー画面でのタイトル表示
 * 観点: CUJ / 操作性 / 連携
 *
 * 手順:
 * 1. トレーナーでログインし、ダッシュボードを開く
 * 2. タイトル・コメント・到達レベルを入力してクエストを作成する
 * 3. ダッシュボードの進捗一覧を確認する
 *
 * 期待結果（表示）:
 * - 作成したクエストにタイトル（旧：大項目）が表示されていること
 * - コメント（旧：小項目）および到達レベル（「Lv〇」形式）も確認できること
 *
 * 期待結果（データ）:
 * - クエスト作成 API が成功し、進捗一覧にタイトル・コメント・到達レベルが反映される
 */
test.describe('E-Q06 トレーナー画面でのタイトル表示', () => {
  test('トレーナー作成後_進捗一覧にタイトルコメント到達レベルが表示される', async ({
    page,
  }) => {
    await loginAsTrainer(page);
    await openTrainerDashboard(page);
    await expect(questCreateRegion(page)).toBeVisible();
    await createQuestWithAchievementLevel(
      page,
      E_Q06_QUEST_NAME,
      E_Q06_SELECTED_ACHIEVEMENT_LEVEL,
      E_Q06_TITLE,
    );
    await expectTrainerQuestProgressDisplay(page, E_Q06_QUEST_NAME, {
      title: E_Q06_TITLE,
      comment: E_Q06_QUEST_NAME,
      achievementLevel: E_Q06_DISPLAY_ACHIEVEMENT_LEVEL,
    });
  });
});
