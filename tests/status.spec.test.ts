import { test, expect, type Page } from '@playwright/test';
import {
  loginAsTrainee,
  loginAsTrainer,
  logout,
} from './helpers/playwright-auth';
import {
  messageThread,
  messageThreadHistory,
  openMessageThread,
  openTrainerMessages,
  sendFreeTextMessage,
  sendTrainerStampReply,
  STAMP_ST1_LABEL,
  REALTIME_UPDATE_TIMEOUT_MS,
} from './helpers/message';

const TRAINER_STATUS_QUEST_OK = '質問OK';
const E_S01_QUESTION_CONTENT = 'ステータス確認E2Eの質問です';

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

async function replyWithStampInThread(
  page: Page,
  stampLabel: string,
): Promise<void> {
  await expect(
    messageThread(page, E_S01_QUESTION_CONTENT).first(),
  ).toBeVisible();
  await openMessageThread(page, E_S01_QUESTION_CONTENT);
  await sendTrainerStampReply(page, stampLabel);
}

async function expectReplyStampOnTrainee(
  page: Page,
  stampLabel: string,
): Promise<void> {
  await openTraineeHome(page);
  await openMessageThread(page, E_S01_QUESTION_CONTENT);

  await expect(
    messageThreadHistory(page)
      .getByRole('listitem')
      .filter({ hasText: stampLabel }),
  ).toBeVisible({ timeout: REALTIME_UPDATE_TIMEOUT_MS });
}

/**
 * E-S01: ステータス確認と質問のEnd-to-End
 * 観点: CUJ / 連携 / 操作性
 *
 * 手順:
 * 1. トレーナーでログインし、ステータスを「質問OK」に変更
 * 2. 新卒でログインし、先輩のステータスが「質問OK」であることを確認
 * 3. 自由記述で質問を送信（並列 E2E とのスレッド衝突を避けるため固有文言を使用）
 * 4. トレーナー画面でルームを開き、ST1 スタンプで返信
 * 5. 新卒で再ログインし、返信スタンプの表示を確認
 *
 * 期待結果（表示）:
 * - 新卒側のスレッド履歴に、トレーナーからの返信スタンプが表示される
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
    await sendFreeTextMessage(page, E_S01_QUESTION_CONTENT);

    await logout(page);
    await loginAsTrainer(page);
    await openTrainerMessages(page);
    await replyWithStampInThread(page, STAMP_ST1_LABEL);

    await logout(page);
    await loginAsTrainee(page);
    await expectReplyStampOnTrainee(page, STAMP_ST1_LABEL);
  });
});
