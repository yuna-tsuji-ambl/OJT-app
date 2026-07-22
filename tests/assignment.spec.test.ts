import { test, expect, type Page } from '@playwright/test';

const ASSIGNMENT_CLEARED_LABEL = 'クリア（承認済み）';
const NEW_ASSIGNMENT_TITLE = '新規クエスト';
const E_A02_ASSIGNMENT_TITLE = 'E-A02新規課題';
const E_A03_ASSIGNMENT_TITLE = 'E-A03編集対象';
const E_A03_UPDATED_TITLE = 'E-A03更新後';
const E_A03_DELETE_TITLE = 'E-A03削除対象';
const ASSIGNMENT_MAJOR_ITEM = '開発基礎';

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

async function openAssignmentList(page: Page): Promise<void> {
  await page.getByRole('link', { name: '課題一覧' }).click();
  await expect(page.getByRole('heading', { name: '課題一覧' })).toBeVisible();
}

async function openAssignmentManage(page: Page): Promise<void> {
  await page.getByRole('link', { name: '課題管理' }).click();
  await expect(page.getByRole('heading', { name: '課題管理' })).toBeVisible();
}

function assignmentArticle(page: Page, title: string) {
  return page.getByRole('article', { name: title, exact: true });
}

function assignmentCreateRegion(page: Page) {
  return page.getByRole('region', { name: '課題作成' });
}

async function createAssignmentOnManage(
  page: Page,
  title: string,
  majorItem: string = ASSIGNMENT_MAJOR_ITEM,
  achievementLevel: string = '1',
): Promise<void> {
  const createResponse = page.waitForResponse(
    (response) =>
      /\/api\/assignments\/?$/.test(new URL(response.url()).pathname) &&
      response.request().method() === 'POST' &&
      response.ok(),
  );

  const createRegion = assignmentCreateRegion(page);
  await createRegion.getByLabel('大項目').fill(majorItem);
  await createRegion.getByLabel('タイトル').fill(title);
  await createRegion.getByLabel('説明').fill('テスト説明');
  await createRegion.getByLabel('到達レベル').selectOption(achievementLevel);
  await createRegion.getByRole('button', { name: '作成' }).click();

  await createResponse;
}

async function requestAssignmentClear(
  page: Page,
  title: string,
): Promise<void> {
  const requestResponse = page.waitForResponse(
    (response) =>
      response.url().includes('/api/assignments') &&
      response.request().method() === 'POST' &&
      response.url().includes('/request') &&
      response.ok(),
  );

  await assignmentArticle(page, title)
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

async function approveAssignment(page: Page, title: string): Promise<void> {
  const approveResponse = page.waitForResponse(
    (response) =>
      response.url().includes('/api/assignments') &&
      response.request().method() === 'POST' &&
      response.url().includes('/approve') &&
      response.ok(),
  );

  await assignmentArticle(page, title)
    .getByRole('button', { name: '承認' })
    .click();

  await approveResponse;
}

test.describe('E-A01 課題作成から新卒一覧反映', () => {
  test('トレーナー作成から新卒確認_新規課題が一覧に表示される', async ({
    page,
  }) => {
    await loginAsTrainer(page);
    await openAssignmentManage(page);
    await createAssignmentOnManage(page, NEW_ASSIGNMENT_TITLE);

    await logout(page);
    await loginAsTrainee(page);
    await openAssignmentList(page);
    await expect(assignmentArticle(page, NEW_ASSIGNMENT_TITLE)).toBeVisible();
    await expect(assignmentArticle(page, NEW_ASSIGNMENT_TITLE)).toContainText(
      ASSIGNMENT_MAJOR_ITEM,
    );
  });
});

test.describe('E-A02 課題の申請から承認まで', () => {
  test('申請から承認_新卒一覧でクリア表示になる', async ({ page }) => {
    await loginAsTrainer(page);
    await openAssignmentManage(page);
    await createAssignmentOnManage(page, E_A02_ASSIGNMENT_TITLE);

    await logout(page);
    await loginAsTrainee(page);
    await openAssignmentList(page);
    await requestAssignmentClear(page, E_A02_ASSIGNMENT_TITLE);

    await logout(page);
    await loginAsTrainer(page);
    await openTrainerDashboard(page);
    await approveAssignment(page, E_A02_ASSIGNMENT_TITLE);

    await logout(page);
    await loginAsTrainee(page);
    await openAssignmentList(page);
    await expect(
      assignmentArticle(page, E_A02_ASSIGNMENT_TITLE).getByText(
        ASSIGNMENT_CLEARED_LABEL,
      ),
    ).toBeVisible();
  });
});

test.describe('E-A03 課題の編集・削除が新卒側に反映', () => {
  test('編集と削除_新卒一覧に反映される', async ({ page }) => {
    await loginAsTrainer(page);
    await openAssignmentManage(page);
    await createAssignmentOnManage(page, E_A03_ASSIGNMENT_TITLE);
    await createAssignmentOnManage(page, E_A03_DELETE_TITLE);

    await logout(page);
    await loginAsTrainee(page);
    await openAssignmentList(page);
    await expect(assignmentArticle(page, E_A03_ASSIGNMENT_TITLE)).toBeVisible();
    await expect(assignmentArticle(page, E_A03_DELETE_TITLE)).toBeVisible();

    await logout(page);
    await loginAsTrainer(page);
    await openAssignmentManage(page);

    const editTarget = assignmentArticle(page, E_A03_ASSIGNMENT_TITLE);
    await editTarget.getByRole('button', { name: '編集' }).click();
    const editRegion = page.getByRole('region', { name: '課題編集' });
    await editRegion.getByLabel('タイトル').fill(E_A03_UPDATED_TITLE);
    await editRegion.getByRole('button', { name: '保存' }).click();

    const deleteResponse = page.waitForResponse(
      (response) =>
        response.url().includes('/api/assignments') &&
        response.request().method() === 'DELETE' &&
        response.ok(),
    );
    await assignmentArticle(page, E_A03_DELETE_TITLE)
      .getByRole('button', { name: '削除' })
      .click();
    await deleteResponse;

    await logout(page);
    await loginAsTrainee(page);
    await openAssignmentList(page);
    await expect(assignmentArticle(page, E_A03_UPDATED_TITLE)).toBeVisible();
    await expect(assignmentArticle(page, E_A03_DELETE_TITLE)).toHaveCount(0);
  });
});

test.describe('E-A04 /quests から /assignments への導線', () => {
  test('旧URLアクセスで課題一覧が表示される', async ({ page }) => {
    await loginAsTrainee(page);
    await page.goto('/quests');
    await expect(page.getByRole('heading', { name: '課題一覧' })).toBeVisible();
    await expect(page).toHaveURL(/\/assignments$/);
  });
});
