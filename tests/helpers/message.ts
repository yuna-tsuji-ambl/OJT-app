import {
  expect,
  type Locator,
  type Page,
  type Response,
} from '@playwright/test';
import {
  formatThreadUpdatedAtLocal,
  MESSAGE_THREAD_LIST_PAGE_SIZE,
} from '@ojt-app/shared';

export { formatThreadUpdatedAtLocal };

export const FREE_TEXT_INPUT_LABEL = '自由記述';

const TRAINEE_HOME_QUESTION_TEMPLATE_FIELD_ID = 'question-template';

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

export const MESSAGE_SENDER_SELF_LABEL = 'あなた';

export const MESSAGE_SENDER_TRAINER_LABEL = 'トレーナー';

export const MESSAGE_SENDER_TRAINEE_LABEL = '新卒';

export const MESSAGE_THREAD_DETAIL_REGION_LABEL = 'スレッド詳細';

export const MESSAGE_THREAD_INLINE_DETAIL_STATE_ATTR = 'data-state';

export const MESSAGE_THREAD_INLINE_DETAIL_OPEN_STATE = 'open';

export const MESSAGE_THREAD_INLINE_DETAIL_CLOSED_STATE = 'closed';

export const MESSAGE_THREAD_ROW_SELECTED_ATTR = 'aria-selected';

export const MESSAGE_THREAD_LIST_NEXT_PAGE_LABEL = '次のページ';

export const MESSAGE_THREAD_HISTORY_ERROR_PATTERN =
  /履歴.*(取得|読み込み).*(できません|失敗)/;

export { MESSAGE_THREAD_LIST_PAGE_SIZE };

export type MessageSenderRole = 'self' | 'other';

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function messageThreadSenderBubble(
  page: Page,
  sender: MessageSenderRole,
  messageText: string,
): Locator {
  return messageThreadRoomHistory(page).locator(
    `article[data-sender="${sender}"]`,
    { hasText: messageText },
  );
}

export function messageThreadSenderName(
  page: Page,
  senderLabel: string,
  messageText: string,
): Locator {
  return messageThreadRoomHistory(page).getByRole('article', {
    name: new RegExp(`${senderLabel}[:：].*${escapeRegExp(messageText)}`),
  });
}

export async function expectBubbleAlignedRight(
  bubble: Locator,
  container: Locator,
): Promise<void> {
  const bubbleBox = await bubble.boundingBox();
  const containerBox = await container.boundingBox();

  expect(bubbleBox).not.toBeNull();
  expect(containerBox).not.toBeNull();

  const bubbleCenterX = bubbleBox!.x + bubbleBox!.width / 2;
  const containerCenterX = containerBox!.x + containerBox!.width / 2;

  expect(bubbleCenterX).toBeGreaterThan(containerCenterX);
}

export async function expectBubbleAlignedLeft(
  bubble: Locator,
  container: Locator,
): Promise<void> {
  const bubbleBox = await bubble.boundingBox();
  const containerBox = await container.boundingBox();

  expect(bubbleBox).not.toBeNull();
  expect(containerBox).not.toBeNull();

  const bubbleCenterX = bubbleBox!.x + bubbleBox!.width / 2;
  const containerCenterX = containerBox!.x + containerBox!.width / 2;

  expect(bubbleCenterX).toBeLessThan(containerCenterX);
}

export function messageThreadUpdatedTime(
  page: Page,
  previewText: string,
): Locator {
  return messageThread(page, previewText).first().getByRole('time');
}

export async function expectMessageThreadUpdatedAt(
  page: Page,
  previewText: string,
  sentAt: Date,
): Promise<void> {
  const updatedTime = messageThreadUpdatedTime(page, previewText);

  await expect(updatedTime).toBeVisible();
  await expect(updatedTime).toHaveText(formatThreadUpdatedAtLocal(sentAt));

  const datetime = await updatedTime.getAttribute('datetime');
  expect(datetime).toBeTruthy();

  const parsed = new Date(datetime!);
  const sentAtMinute = new Date(sentAt);
  sentAtMinute.setSeconds(0, 0);
  sentAtMinute.setMilliseconds(0);

  const parsedMinute = new Date(parsed);
  parsedMinute.setSeconds(0, 0);
  parsedMinute.setMilliseconds(0);

  expect(parsedMinute.getTime()).toBe(sentAtMinute.getTime());
}

export function messageThreadArticles(page: Page) {
  return messageThreadList(page)
    .locator(':scope > [role="listitem"]')
    .getByRole('article');
}

export async function goToMessageThreadListPageContaining(
  page: Page,
  previewText: string,
): Promise<void> {
  const nextButton = messageThreadListNextPageButton(page);

  while (
    !(await messageThreadListItem(page, previewText, 'first').isVisible())
  ) {
    if (!(await nextButton.isVisible())) {
      throw new Error(`Thread not found on any page: ${previewText}`);
    }

    await nextButton.click();
  }
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
  await expect(messageThreadDetail(page)).toBeVisible();
  await expect(
    messageThreadRoomHistory(page)
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
  return page
    .locator(`#${TRAINEE_HOME_QUESTION_TEMPLATE_FIELD_ID}`)
    .locator('xpath=ancestor::*[@role="region"][1]');
}

export function messageThreadList(page: Page) {
  return page.getByRole('list', { name: 'メッセージスレッド一覧' });
}

export function messageThread(page: Page, previewText: string) {
  return messageThreadList(page)
    .getByRole('listitem')
    .getByRole('article', { name: previewText, exact: true });
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

const MESSAGE_THREAD_HISTORY_SCROLL_TOLERANCE_PX = 1;

export async function expectMessageThreadHistoryScrolledToBottom(
  history: Locator,
): Promise<void> {
  await expect(history).toBeVisible();

  const isScrolledToBottom = await history.evaluate(
    (element, tolerance) =>
      element.scrollTop + element.clientHeight >=
      element.scrollHeight - tolerance,
    MESSAGE_THREAD_HISTORY_SCROLL_TOLERANCE_PX,
  );

  expect(isScrolledToBottom).toBe(true);
}

export async function expectMessageBubbleWithinHistoryViewport(
  history: Locator,
  bubble: Locator,
): Promise<void> {
  await expect(bubble).toBeVisible();

  const isWithinViewport = await bubble.evaluate((bubbleElement, tolerance) => {
    const historyElement = bubbleElement.closest('[role="log"]');

    if (!historyElement) {
      return false;
    }

    const historyRect = historyElement.getBoundingClientRect();
    const bubbleRect = bubbleElement.getBoundingClientRect();

    return (
      bubbleRect.bottom <= historyRect.bottom + tolerance &&
      bubbleRect.top >= historyRect.top - tolerance
    );
  }, MESSAGE_THREAD_HISTORY_SCROLL_TOLERANCE_PX);

  expect(isWithinViewport).toBe(true);
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

function isSuccessfulMessagePost(response: Response): boolean {
  return (
    response.url().includes('/api/status/messages') &&
    response.request().method() === 'POST' &&
    response.ok()
  );
}

async function clickMessageSendAndWaitForThreads(page: Page): Promise<void> {
  const sendResponse = page.waitForResponse(isSuccessfulMessagePost);
  await messageSendRegion(page).getByRole('button', { name: '送信' }).click();
  await sendResponse;
  await waitForMessageThreadsLoaded(page);
}

export async function sendSelectedMessage(page: Page): Promise<void> {
  await clickMessageSendAndWaitForThreads(page);
}

async function closeOpenInlineMessageThread(page: Page): Promise<void> {
  const openDetail = openInlineMessageThreadDetails(page);

  if ((await openDetail.count()) === 0) {
    return;
  }

  await expect(openDetail).toBeVisible();

  const threadId = await openDetail.getAttribute('data-thread-id');

  if (!threadId) {
    return;
  }

  await messageThreadRowById(page, threadId).getByRole('article').click();
  await expect(openDetail).toBeHidden();
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
  await freeTextInput(page).fill(content);
  await clickMessageSendAndWaitForThreads(page);
  // 並列 E2E で共有 API に他スレッドが先行することがあるため、先頭行前提にしない
  await expect(messageThreadListItem(page, content)).toBeVisible();
  await closeOpenInlineMessageThread(page);
}

export type MessageThreadRowPosition = 'first' | 'last';

export function messageThreadListItem(
  page: Page,
  previewText: string,
  position: MessageThreadRowPosition = 'first',
): Locator {
  const matchingRows = messageThreadList(page)
    .getByRole('listitem')
    .filter({
      has: page.getByRole('article', { name: previewText, exact: true }),
    });

  if (position === 'first') {
    return matchingRows.first();
  }

  return matchingRows.last();
}

export function messageThreadRowById(page: Page, threadId: string): Locator {
  return messageThreadList(page).locator(
    `[role="listitem"][data-thread-id="${threadId}"]`,
  );
}

/** 右ペインのトーク詳細（スプリットビュー）。旧インライン直下展開の locator 名は互換のため維持 */
export function inlineMessageThreadDetailAfterThreadId(
  page: Page,
  threadId: string,
): Locator {
  return page.locator(
    `[role="region"][aria-label="${MESSAGE_THREAD_DETAIL_REGION_LABEL}"][data-thread-id="${threadId}"]`,
  );
}

export function inlineMessageThreadDetailAfterRow(
  page: Page,
  previewText: string,
  _position: MessageThreadRowPosition = 'first',
  threadId?: string,
): Locator {
  if (threadId) {
    return inlineMessageThreadDetailAfterThreadId(page, threadId);
  }

  return openInlineMessageThreadDetails(page).filter({
    has: page.getByText(previewText, { exact: false }),
  });
}

export function openInlineMessageThreadDetails(page: Page): Locator {
  return page.locator(
    `[role="region"][aria-label="${MESSAGE_THREAD_DETAIL_REGION_LABEL}"][${MESSAGE_THREAD_INLINE_DETAIL_STATE_ATTR}="${MESSAGE_THREAD_INLINE_DETAIL_OPEN_STATE}"]`,
  );
}

export function messageThreadListNextPageButton(page: Page): Locator {
  return page.getByRole('button', {
    name: MESSAGE_THREAD_LIST_NEXT_PAGE_LABEL,
  });
}

export function messageThreadHistoryError(page: Page): Locator {
  return page.getByRole('alert');
}

export async function clickClosedMessageThreadRow(page: Page): Promise<void> {
  const closedDetail = page.locator(
    `[role="region"][aria-label="${MESSAGE_THREAD_DETAIL_REGION_LABEL}"][${MESSAGE_THREAD_INLINE_DETAIL_STATE_ATTR}="${MESSAGE_THREAD_INLINE_DETAIL_CLOSED_STATE}"]`,
  );

  await closedDetail
    .locator('xpath=preceding-sibling::*[@role="listitem"][1]')
    .getByRole('article')
    .click();
}

export async function clickMessageThreadRow(
  page: Page,
  previewText: string,
  position: MessageThreadRowPosition = 'first',
): Promise<string> {
  const row = messageThreadListItem(page, previewText, position);

  await row.getByRole('article', { name: previewText, exact: true }).click();

  const threadId = await row.getAttribute('data-thread-id');

  if (!threadId) {
    throw new Error(`Thread row not found for preview: ${previewText}`);
  }

  return threadId;
}

export async function clickMessageThreadRowAndWaitForHistory(
  page: Page,
  previewText: string,
  position: MessageThreadRowPosition = 'first',
): Promise<void> {
  const historyLoaded = waitForThreadHistoryLoaded(page);
  const threadId = await clickMessageThreadRow(page, previewText, position);

  await historyLoaded;
  await expectInlineDetailOpenAfterRow(page, previewText, position, threadId);
}

export async function expectInlineDetailOpenAfterRow(
  page: Page,
  previewText: string,
  position: MessageThreadRowPosition = 'first',
  threadId?: string,
): Promise<void> {
  const detail = inlineMessageThreadDetailAfterRow(
    page,
    previewText,
    position,
    threadId,
  );

  await expect
    .poll(async () => detail.isVisible(), {
      timeout: REALTIME_UPDATE_TIMEOUT_MS,
    })
    .toBe(true);
  await expect(detail).toHaveAttribute(
    MESSAGE_THREAD_INLINE_DETAIL_STATE_ATTR,
    MESSAGE_THREAD_INLINE_DETAIL_OPEN_STATE,
  );
  await expect(detail.getByRole('log', { name: 'スレッド履歴' })).toBeVisible();
}

export async function expectInlineDetailClosedAfterRow(
  page: Page,
  previewText: string,
): Promise<void> {
  const detail = inlineMessageThreadDetailAfterRow(page, previewText);

  await expect(detail).toHaveAttribute(
    MESSAGE_THREAD_INLINE_DETAIL_STATE_ATTR,
    MESSAGE_THREAD_INLINE_DETAIL_CLOSED_STATE,
  );
  await expect(detail).toBeHidden();
}

export async function expectMessageThreadRowSelected(
  page: Page,
  previewText: string,
): Promise<void> {
  await expect(messageThread(page, previewText).first()).toHaveAttribute(
    MESSAGE_THREAD_ROW_SELECTED_ATTR,
    'true',
  );
}

export async function expectMessageThreadRowNotSelected(
  page: Page,
  previewText: string,
): Promise<void> {
  await expect(messageThread(page, previewText).first()).toHaveAttribute(
    MESSAGE_THREAD_ROW_SELECTED_ATTR,
    'false',
  );
}

export async function expectOpenInlineDetailsCount(
  page: Page,
  count: number,
): Promise<void> {
  await expect(openInlineMessageThreadDetails(page)).toHaveCount(count);
}

export async function expectInlineDetailOpensWithExpandingHeight(
  page: Page,
  previewText: string,
): Promise<void> {
  const threadId = await clickMessageThreadRow(page, previewText);
  const detail = inlineMessageThreadDetailAfterThreadId(page, threadId);

  await expectInlineDetailOpenAfterRow(page, previewText, 'first', threadId);
  await expect(detail).toBeVisible();
  await expect(detail).toHaveAttribute(
    MESSAGE_THREAD_INLINE_DETAIL_STATE_ATTR,
    MESSAGE_THREAD_INLINE_DETAIL_OPEN_STATE,
  );

  await expect
    .poll(async () =>
      detail.evaluate((element) => element.getBoundingClientRect().height),
    )
    .toBeGreaterThan(0);
}

export async function expectInlineDetailClosesWithCollapsingHeight(
  page: Page,
  previewText: string,
): Promise<void> {
  const openedDetail = openInlineMessageThreadDetails(page);
  const threadId = await openedDetail.getAttribute('data-thread-id');

  if (!threadId) {
    throw new Error(
      `Open inline detail thread id not found for: ${previewText}`,
    );
  }

  const detail = inlineMessageThreadDetailAfterThreadId(page, threadId);
  const heightBefore = await detail.evaluate(
    (element) => element.getBoundingClientRect().height,
  );

  expect(heightBefore).toBeGreaterThan(0);

  await clickMessageThreadRow(page, previewText, 'first');

  await expect(detail).toHaveAttribute(
    MESSAGE_THREAD_INLINE_DETAIL_STATE_ATTR,
    MESSAGE_THREAD_INLINE_DETAIL_CLOSED_STATE,
  );
  await expect
    .poll(async () =>
      detail.evaluate((element) => element.getBoundingClientRect().height),
    )
    .toBeLessThan(heightBefore);
  await expect(detail).toBeHidden();
}

export async function expectInlineDetailSwitchBetweenRows(
  page: Page,
  fromPreview: string,
  toPreview: string,
): Promise<void> {
  await clickMessageThreadRowAndWaitForHistory(page, toPreview);

  await expectOpenInlineDetailsCount(page, 1);
  await expectInlineDetailOpenAfterRow(page, toPreview);
  await expectMessageThreadRowSelected(page, toPreview);
  await expectMessageThreadRowNotSelected(page, fromPreview);
  await expect(
    inlineMessageThreadDetailAfterRow(page, fromPreview),
  ).toHaveCount(0);
  await expect(
    inlineMessageThreadDetailAfterRow(page, toPreview)
      .getByRole('log', { name: 'スレッド履歴' })
      .getByRole('article')
      .filter({ hasText: toPreview }),
  ).toBeVisible();
}

export async function seedTraineeFreeTextThreads(
  page: Page,
  count: number,
  contentPrefix: string,
): Promise<readonly string[]> {
  const previews: string[] = [];

  for (let index = 0; index < count; index += 1) {
    const content = `${contentPrefix}-${String(index + 1).padStart(2, '0')}`;
    previews.push(content);
    await sendFreeTextMessage(page, content);
  }

  return previews;
}

export async function mockEmptyMessageThreadList(page: Page): Promise<void> {
  await page.route('**/api/status/messages?*view=threads*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: '[]',
    });
  });
}

export async function mockMessageThreadHistoryFailure(
  page: Page,
): Promise<void> {
  await page.route('**/api/status/messages?*view=thread*', async (route) => {
    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Failed to load thread history' }),
    });
  });
}

/** スプリットビュー: 再クリックでも選択維持、別ルームへ切替 */
export async function assertInlineOpenCloseAndSwitchBehavior(
  page: Page,
  threadA: string,
  threadB: string,
): Promise<void> {
  await clickMessageThreadRowAndWaitForHistory(page, threadA);
  await expectInlineDetailOpenAfterRow(page, threadA);
  await expectMessageThreadRowSelected(page, threadA);

  await clickMessageThreadRow(page, threadA);
  await expectInlineDetailOpenAfterRow(page, threadA);
  await expectMessageThreadRowSelected(page, threadA);
  await expectOpenInlineDetailsCount(page, 1);

  await expectInlineDetailSwitchBetweenRows(page, threadA, threadB);
}
