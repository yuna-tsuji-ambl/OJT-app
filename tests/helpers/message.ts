import { expect, type Locator, type Page } from '@playwright/test';

export const FREE_TEXT_INPUT_LABEL = '自由記述';

export const QUESTION_TEMPLATE_TQ1_LABEL = '〇〇の件で3分いいですか？';

export const QUESTION_TEMPLATE_TQ3_LABEL = 'レビューをお願いしたいです';

export const QUESTION_TEMPLATE_LABELS = [
  '〇〇の件で3分いいですか？',
  'わからないことがあるので教えてください',
  'レビューをお願いしたいです',
  '今忙しいですか？',
  '相談したいことがあります',
] as const;

export const REPLY_TEMPLATE_LABELS = [
  '今は手が離せません。後で連絡します',
  '質問OKです。声をかけてください',
  'ドキュメントを確認してみてください',
  '明日の1on1で話しましょう',
  '状況を共有してください',
] as const;

export const FREE_TEXT_MESSAGE_E_M02 = 'ペアプロをお願いします';

export const REPLY_TEMPLATE_TT2_LABEL = '質問OKです。声をかけてください';

export const REPLY_TEMPLATE_TT4_LABEL = '明日の1on1で話しましょう';

export const STAMP_ST1_LABEL = '👍 OK';

export const TRAINER_STAMP_LABELS = [
  '👍 OK',
  '🙏 ありがとう',
  '✅ 了解',
  '⏰ あとで',
  '❓ 詳しく',
] as const;

export const TRAINEE_STAMP_LABELS = [
  '🙇 ありがとうございます',
  '✅ 承知いたしました',
  '🙏 よろしくお願いいたします',
  '⏰ 後ほど確認いたします',
  '❓ 詳しく教えていただけますか',
] as const;

export const TRAINEE_STAMP_STS1_LABEL = TRAINEE_STAMP_LABELS[0];

export const LEGACY_REPLY_STAMP_LABEL = '後で話そう';

export const STAMP_REPLY_REGION_LABEL = 'スタンプ返信';

export const REALTIME_UPDATE_TIMEOUT_MS = 10_000;

export function messageThreadArticles(page: Page) {
  return messageThreadList(page).getByRole('article');
}

export async function expectRealtimeThreadOnTrainer(
  page: Page,
  previewText: string,
): Promise<void> {
  await expect(messageThread(page, previewText).first()).toBeVisible({
    timeout: REALTIME_UPDATE_TIMEOUT_MS,
  });
}

export async function expectRealtimeMessageInTraineeHistory(
  page: Page,
  messageText: string,
): Promise<void> {
  await expect(
    messageThreadHistory(page)
      .getByRole('listitem')
      .filter({ hasText: messageText }),
  ).toBeVisible({ timeout: REALTIME_UPDATE_TIMEOUT_MS });
}

export function traineeThreadStampReplyRegion(page: Page) {
  return messageThreadDetail(page).getByRole('region', {
    name: STAMP_REPLY_REGION_LABEL,
  });
}

export function trainerThreadStampReplyRegion(page: Page) {
  return messageThreadDetail(page).getByRole('region', {
    name: STAMP_REPLY_REGION_LABEL,
  });
}

export async function expectHorizontalStampBar(
  stampRegion: Locator,
  stampLabels: readonly string[],
): Promise<void> {
  await expect(stampRegion).toBeVisible();

  const buttons = stampRegion.getByRole('button');
  await expect(buttons).toHaveCount(stampLabels.length);

  for (const label of stampLabels) {
    await expect(
      stampRegion.getByRole('button', { name: label }),
    ).toBeVisible();
  }

  const rowTops = await buttons.evaluateAll((nodes) =>
    nodes.map((node) => node.getBoundingClientRect().top),
  );
  const minTop = Math.min(...rowTops);
  const maxTop = Math.max(...rowTops);

  expect(maxTop - minTop).toBeLessThanOrEqual(1);
}

export async function expectLegacyReplyStampAbsent(page: Page): Promise<void> {
  await expect(
    page.getByRole('button', { name: LEGACY_REPLY_STAMP_LABEL }),
  ).toHaveCount(0);
}

export function trainerStampReplyRegion(page: Page) {
  return page.getByRole('region', { name: 'スタンプ返信' });
}

export async function sendTrainerStampReply(
  page: Page,
  stampLabel: string,
): Promise<void> {
  const replyResponse = page.waitForResponse(
    (response) =>
      response.url().includes('/api/status/messages') &&
      response.request().method() === 'POST' &&
      response.ok(),
  );

  await trainerStampReplyRegion(page)
    .getByRole('button', { name: stampLabel })
    .click();

  await replyResponse;
}

export async function sendTraineeStampReply(
  page: Page,
  stampLabel: string,
): Promise<void> {
  const replyResponse = page.waitForResponse(
    (response) =>
      response.url().includes('/api/status/messages') &&
      response.request().method() === 'POST' &&
      response.ok(),
  );

  await traineeThreadStampReplyRegion(page)
    .getByRole('button', { name: stampLabel })
    .click();

  await replyResponse;
}

export async function expectRealtimeMessageInTrainerThreadHistory(
  page: Page,
  messageText: string,
): Promise<void> {
  await expect(
    messageThreadHistory(page)
      .getByRole('listitem')
      .filter({ hasText: messageText }),
  ).toBeVisible({ timeout: REALTIME_UPDATE_TIMEOUT_MS });
}

export function messageSendRegion(page: Page) {
  return page.getByRole('region', { name: 'メッセージ送信' });
}

export function messageThreadList(page: Page) {
  return page.getByRole('list', { name: 'メッセージスレッド一覧' });
}

export function messageThread(page: Page, previewText: string) {
  return messageThreadList(page).getByRole('article', { name: previewText });
}

export function messageThreadDetail(page: Page) {
  return page.getByRole('region', { name: 'スレッド詳細' });
}

export function messageThreadHistory(page: Page) {
  return page.getByRole('log', { name: 'スレッド履歴' });
}

export function traineeThreadRoomSendRegion(page: Page) {
  return messageThreadDetail(page).getByRole('region', {
    name: 'メッセージ送信',
  });
}

export function messageThreadRoomHistory(page: Page) {
  return messageThreadDetail(page).getByRole('log', { name: 'スレッド履歴' });
}

export function messageThreadBubbles(page: Page) {
  return messageThreadRoomHistory(page).getByRole('article');
}

export async function sendFollowUpInThreadRoom(
  page: Page,
  content: string,
): Promise<void> {
  const sendResponse = page.waitForResponse(
    (response) =>
      response.url().includes('/api/status/messages') &&
      response.request().method() === 'POST' &&
      response.ok(),
  );
  const threadSendRegion = traineeThreadRoomSendRegion(page);

  await threadSendRegion
    .getByRole('textbox', { name: FREE_TEXT_INPUT_LABEL })
    .fill(content);
  await threadSendRegion.getByRole('button', { name: '送信' }).click();

  await sendResponse;
}

export function trainerReplyRegion(page: Page) {
  return page.getByRole('region', { name: 'メッセージ返信' });
}

export function trainerNewMessageRegion(page: Page) {
  return page.getByRole('region', { name: '新規メッセージ送信' });
}

export async function selectTrainerNewMessageTemplate(
  page: Page,
  templateLabel: string,
): Promise<void> {
  await trainerNewMessageRegion(page)
    .getByRole('combobox', { name: 'メッセージテンプレート' })
    .selectOption({ label: templateLabel });
}

export async function sendTrainerNewMessage(page: Page): Promise<void> {
  const sendResponse = page.waitForResponse(
    (response) =>
      response.url().includes('/api/status/messages') &&
      response.request().method() === 'POST' &&
      response.ok(),
  );

  await trainerNewMessageRegion(page)
    .getByRole('button', { name: '送信' })
    .click();

  await sendResponse;
}

export async function openMessageThread(
  page: Page,
  previewText: string,
): Promise<void> {
  const historyLoaded = waitForThreadHistoryLoaded(page);
  await messageThread(page, previewText).first().click();
  await expect(messageThreadDetail(page)).toBeVisible();
  await historyLoaded;
}

export async function selectReplyTemplate(
  page: Page,
  templateLabel: string,
): Promise<void> {
  await trainerReplyRegion(page)
    .getByRole('combobox', { name: '返信テンプレート' })
    .selectOption({ label: templateLabel });
}

export async function sendTrainerReply(page: Page): Promise<void> {
  const replyResponse = page.waitForResponse(
    (response) =>
      response.url().includes('/api/status/messages') &&
      response.request().method() === 'POST' &&
      response.ok(),
  );

  await trainerReplyRegion(page).getByRole('button', { name: '送信' }).click();

  await replyResponse;
}

export async function openTraineeHome(page: Page): Promise<void> {
  await page.goto('/home');
  await expect(page.getByRole('heading', { name: 'ホーム' })).toBeVisible();
}

export async function openTrainerMessages(page: Page): Promise<void> {
  await page.goto('/messages');
  await expect(page.getByRole('heading', { name: 'メッセージ' })).toBeVisible();
}

export async function waitForMessageThreadsLoaded(page: Page): Promise<void> {
  await page.waitForResponse(
    (response) =>
      response.url().includes('/api/status/messages') &&
      response.url().includes('view=threads') &&
      response.request().method() === 'GET' &&
      response.ok(),
  );
}

export function waitForThreadHistoryLoaded(page: Page) {
  return page.waitForResponse(
    (response) =>
      response.url().includes('/api/status/messages') &&
      response.url().includes('view=thread') &&
      response.request().method() === 'GET' &&
      response.ok(),
  );
}

export async function openTrainerMessagesAndWaitForThreads(
  page: Page,
): Promise<void> {
  const threadsLoaded = waitForMessageThreadsLoaded(page);
  await openTrainerMessages(page);
  await threadsLoaded;
  await expect(messageThreadList(page)).toBeVisible();
}

export async function selectQuestionTemplate(
  page: Page,
  templateLabel: string,
): Promise<void> {
  await messageSendRegion(page)
    .getByRole('combobox', { name: '質問テンプレート' })
    .selectOption({ label: templateLabel });
}

export async function sendSelectedMessage(page: Page): Promise<void> {
  const sendResponse = page.waitForResponse(
    (response) =>
      response.url().includes('/api/status/messages') &&
      response.request().method() === 'POST' &&
      response.ok(),
  );

  await messageSendRegion(page).getByRole('button', { name: '送信' }).click();

  await sendResponse;
}

export function questionTemplateCombobox(page: Page) {
  return messageSendRegion(page).getByRole('combobox', {
    name: '質問テンプレート',
  });
}

export function trainerMessageTemplateCombobox(page: Page) {
  return trainerNewMessageRegion(page).getByRole('combobox', {
    name: 'メッセージテンプレート',
  });
}

export function freeTextInput(page: Page) {
  return messageSendRegion(page).getByRole('textbox', {
    name: FREE_TEXT_INPUT_LABEL,
  });
}

export function trainerFreeTextInput(page: Page) {
  return trainerNewMessageRegion(page).getByRole('textbox', {
    name: FREE_TEXT_INPUT_LABEL,
  });
}

export async function expectComboboxWithSelectableOptions(
  combobox: Locator,
  optionLabels: readonly string[],
): Promise<void> {
  await expect(combobox).toBeVisible();

  for (const label of optionLabels) {
    await combobox.selectOption({ label });
    await expect(combobox.locator('option:checked')).toHaveText(label);
  }
}

export async function sendFreeTextMessage(
  page: Page,
  content: string,
): Promise<void> {
  const sendResponse = page.waitForResponse(
    (response) =>
      response.url().includes('/api/status/messages') &&
      response.request().method() === 'POST' &&
      response.ok(),
  );
  const threadsLoaded = waitForMessageThreadsLoaded(page);

  await freeTextInput(page).fill(content);
  await messageSendRegion(page).getByRole('button', { name: '送信' }).click();

  await sendResponse;
  await threadsLoaded;
}
