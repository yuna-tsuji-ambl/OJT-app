import { test, expect, type Page } from '@playwright/test';

const TRAINER_STATUS_QUEST_OK = '質問OK';
const QUESTION_TEMPLATE = '〇〇の件で3分いいですか？';
const REPLY_STAMP = '後で話そう';

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

async function openTrainerStatusSettings(page: Page): Promise<void> {
  await page.getByRole('link', { name: 'ステータス設定' }).click();
  await expect(
    page.getByRole('heading', { name: 'ステータス設定' }),
  ).toBeVisible();
}

async function setTrainerStatus(page: Page, status: string): Promise<void> {
  const updateResponse = page.waitForResponse(
    (response) =>
      response.url().includes('/api/status') &&
      ['POST', 'PUT', 'PATCH'].includes(response.request().method()) &&
      response.ok(),
  );

  await page.getByRole('radio', { name: status }).check();

  await updateResponse;
  await expect(page.getByText(status)).toBeVisible();
}

async function openTraineeHome(page: Page): Promise<void> {
  await page.getByRole('link', { name: 'ホーム' }).click();
  await expect(page.getByRole('heading', { name: 'ホーム' })).toBeVisible();
}

function trainerStatusRegion(page: Page) {
  return page.getByRole('region', { name: '先輩のステータス' });
}

function chatHistory(page: Page) {
  return page.getByRole('log', { name: 'チャット履歴' });
}

async function sendQuickQuestion(page: Page): Promise<void> {
  const sendResponse = page.waitForResponse(
    (response) =>
      response.url().includes('/api/status/messages') &&
      response.request().method() === 'POST' &&
      response.ok(),
  );

  await page.getByRole('button', { name: QUESTION_TEMPLATE }).click();
  await page.getByRole('button', { name: '送信' }).click();

  await sendResponse;
  await expect(chatHistory(page).getByText(QUESTION_TEMPLATE)).toBeVisible();
}

async function openTrainerMessages(page: Page): Promise<void> {
  await page.getByRole('link', { name: 'メッセージ' }).click();
  await expect(page.getByRole('heading', { name: 'メッセージ' })).toBeVisible();
}

async function replyWithStamp(page: Page, stamp: string): Promise<void> {
  const replyResponse = page.waitForResponse(
    (response) =>
      response.url().includes('/api/status/messages') &&
      response.request().method() === 'POST' &&
      response.ok(),
  );

  await expect(chatHistory(page).getByText(QUESTION_TEMPLATE)).toBeVisible();
  await page.getByRole('button', { name: stamp }).click();

  await replyResponse;
}

async function expectReplyStampOnTrainee(page: Page, stamp: string): Promise<void> {
  await openTraineeHome(page);
  await expect(chatHistory(page).getByText(stamp)).toBeVisible();
}

/**
 * E-S01: ステータス確認と質問のEnd-to-End
 * 観点: CUJ / 連携 / 操作性
 *
 * 手順:
 * 1. トレーナーでログインし、ステータスを「質問OK」に変更
 * 2. 新卒でログインし、先輩のステータスが「質問OK」であることを確認
 * 3. テンプレを使って質問を送信
 * 4. トレーナー画面に戻り、質問を受信したことを確認してスタンプで返信
 * 5. 新卒で再ログインし、返信スタンプの表示を確認
 *
 * 期待結果（表示）:
 * - 新卒側のチャット履歴に、トレーナーからの返信スタンプが表示される
 *
 * 期待結果（データ）:
 * - ステータス変更・質問送信・返信送信の API が成功し、再ログイン後も返信が維持される
 */
test.describe('E-S01 ステータス確認と質問のEnd-to-End', () => {
  test('ステータス確認から質問返信_新卒に返信スタンプが表示される', async ({
    page,
  }) => {
    await loginAsTrainer(page);
    await openTrainerStatusSettings(page);
    await setTrainerStatus(page, TRAINER_STATUS_QUEST_OK);

    await logout(page);
    await loginAsTrainee(page);
    await openTraineeHome(page);
    await expect(trainerStatusRegion(page)).toHaveText(TRAINER_STATUS_QUEST_OK);
    await sendQuickQuestion(page);

    await logout(page);
    await loginAsTrainer(page);
    await openTrainerMessages(page);
    await replyWithStamp(page, REPLY_STAMP);

    await logout(page);
    await loginAsTrainee(page);
    await expectReplyStampOnTrainee(page, REPLY_STAMP);
  });
});
