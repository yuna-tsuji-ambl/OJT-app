import { test, expect } from '@playwright/test';
import {
  loginAsTrainee,
  loginAsTrainer,
  logout,
} from './helpers/playwright-auth';
import {
  expectComboboxWithSelectableOptions,
  expectHorizontalStampBar,
  expectLegacyReplyStampAbsent,
  expectRealtimeMessageInTraineeHistory,
  expectRealtimeMessageInTrainerThreadHistory,
  expectRealtimeThreadOnTrainer,
  FREE_TEXT_MESSAGE_E_M02,
  freeTextInput,
  messageSendRegion,
  messageThread,
  messageThreadArticles,
  messageThreadBubbles,
  messageThreadDetail,
  messageThreadHistory,
  messageThreadList,
  messageThreadRoomHistory,
  messageThreadSenderBubble,
  messageThreadSenderName,
  MESSAGE_SENDER_SELF_LABEL,
  MESSAGE_SENDER_TRAINEE_LABEL,
  MESSAGE_SENDER_TRAINER_LABEL,
  expectBubbleAlignedLeft,
  expectBubbleAlignedRight,
  expectMessageBubbleWithinHistoryViewport,
  expectMessageThreadHistoryScrolledToBottom,
  expectMessageThreadUpdatedAt,
  assertInlineOpenCloseAndSwitchBehavior,
  clickMessageThreadRow,
  clickMessageThreadRowAndWaitForHistory,
  expectInlineDetailOpenAfterRow,
  expectInlineDetailOpensWithExpandingHeight,
  expectInlineDetailSwitchBetweenRows,
  expectMessageThreadRowNotSelected,
  expectMessageThreadRowSelected,
  expectOpenInlineDetailsCount,
  goToMessageThreadListPageContaining,
  inlineMessageThreadDetailAfterRow,
  messageThreadHistoryError,
  MESSAGE_THREAD_HISTORY_ERROR_PATTERN,
  MESSAGE_THREAD_LIST_PAGE_SIZE,
  mockEmptyMessageThreadList,
  mockMessageThreadHistoryFailure,
  openInlineMessageThreadDetails,
  seedTraineeFreeTextThreads,
  openMessageThread,
  openTrainerMessages,
  openTrainerMessagesAndWaitForThreads,
  openTraineeHome,
  QUESTION_TEMPLATE_LABELS,
  QUESTION_TEMPLATE_TQ1_LABEL,
  QUESTION_TEMPLATE_TQ3_LABEL,
  questionTemplateCombobox,
  REALTIME_UPDATE_TIMEOUT_MS,
  REPLY_TEMPLATE_LABELS,
  REPLY_TEMPLATE_TT2_LABEL,
  REPLY_TEMPLATE_TT4_LABEL,
  selectQuestionTemplate,
  selectReplyTemplate,
  selectTrainerNewMessageTemplate,
  sendFollowUpInThreadRoom,
  sendFreeTextMessage,
  sendSelectedMessage,
  sendTraineeStampReply,
  sendTrainerNewMessage,
  sendTrainerReply,
  sendTrainerStampReply,
  STAMP_ST1_LABEL,
  TRAINEE_STAMP_STS1_LABEL,
  TRAINEE_STAMP_LABELS,
  TRAINER_STAMP_LABELS,
  traineeThreadStampReplyRegion,
  trainerThreadStampReplyRegion,
  trainerFreeTextInput,
  trainerMessageTemplateCombobox,
  trainerNewMessageRegion,
  traineeThreadRoomSendRegion,
  waitForMessageThreadsLoaded,
} from './helpers/message';

const E_M03_QUESTION_CONTENT = 'E-M03スレッド返信の確認です';
const E_M04_QUESTION_CONTENT = 'E-M04スタンプ返信の確認です';
const E_M11_INITIAL_MESSAGE = 'E-M11 LINE風ルームの初回メッセージ';
const E_M11_FOLLOW_UP_MESSAGE = 'E-M11追記の自由記述です';
const E_M12_QUESTION_CONTENT = 'E-M12スタンプバー配置の確認です';
const E_M13_QUESTION_CONTENT = 'E-M13新卒敬語スタンプ返信の確認です';
const E_M14_QUESTION_CONTENT = 'E-M14送信者表示の確認です';
const E_M16_QUESTION_CONTENT = `E-M16下端固定の確認です。${'スクロール検証用の長文です。'.repeat(30)}`;

const E_M17_THREAD_A_CONTENT = 'E-M17ルームAのメッセージ';
const E_M17_THREAD_B_CONTENT = 'E-M17ルームBのメッセージ';
const E_M17_PAGING_PREFIX = 'E-M17-paging';

test.describe.configure({ mode: 'serial' });

/**
 * E-M01: 新卒テンプレ送信からトレーナー確認
 * 観点: CUJ / 連携 / 操作性
 *
 * 手順:
 * 1. 新卒で `/home` を開く
 * 2. テンプレートドロップダウンから TQ1 を選択して送信
 * 3. ログアウトしトレーナーで `/messages` を開く
 *
 * 期待結果（表示）:
 * - トレーナーのメッセージ画面に、送信した TQ1 の内容がスレッドとして表示される
 *
 * 期待結果（データ）:
 * - メッセージ送信 API（POST /api/status/messages）が成功する
 */
test.describe('E-M01 新卒テンプレ送信からトレーナー確認', () => {
  test('新卒TQ1送信_トレーナーメッセージ画面にスレッドが表示される', async ({
    page,
  }) => {
    await loginAsTrainee(page);
    await openTraineeHome(page);
    await selectQuestionTemplate(page, QUESTION_TEMPLATE_TQ1_LABEL);
    await sendSelectedMessage(page);

    await logout(page);
    await loginAsTrainer(page);
    await openTrainerMessages(page);

    await expect(messageThreadList(page)).toBeVisible();
    await expect(
      messageThread(page, QUESTION_TEMPLATE_TQ1_LABEL).first(),
    ).toBeVisible();
  });
});

/**
 * E-M02: 自由記述メッセージの送受信
 * 観点: CUJ / 連携 / 操作性
 *
 * 手順:
 * 1. 新卒で `/home` を開く
 * 2. 自由記述欄に「ペアプロをお願いします」と入力して送信
 * 3. ログアウトしトレーナーで `/messages` を開く
 *
 * 期待結果（表示）:
 * - トレーナーのメッセージ画面に、送信した自由記述の全文がスレッドとして表示される
 *
 * 期待結果（データ）:
 * - メッセージ送信 API（POST /api/status/messages）が成功する
 */
test.describe('E-M02 自由記述メッセージの送受信', () => {
  test('新卒自由記述送信_トレーナーメッセージ画面に全文がスレッド表示される', async ({
    page,
  }) => {
    await loginAsTrainee(page);
    await openTraineeHome(page);
    await sendFreeTextMessage(page, FREE_TEXT_MESSAGE_E_M02);

    await logout(page);
    await loginAsTrainer(page);
    await openTrainerMessages(page);

    await expect(messageThreadList(page)).toBeVisible();
    await expect(
      messageThread(page, FREE_TEXT_MESSAGE_E_M02).first(),
    ).toBeVisible();
  });
});

/**
 * E-M03: スレッドへの返信と新卒側反映
 * 観点: CUJ / 連携 / 操作性
 *
 * 手順:
 * 1. E-M01 の続き: 新卒が TQ1 を送信し、トレーナーが当該スレッドを開いて TT2 で返信
 * 2. 新卒で `/home` を開く
 *
 * 期待結果（表示）:
 * - 新卒側のスレッド履歴に、質問（TQ1）と返信（TT2）が時系列で表示される
 *
 * 期待結果（データ）:
 * - 返信送信 API（POST /api/status/messages）が成功する
 */
test.describe('E-M03 スレッドへの返信と新卒側反映', () => {
  test('トレーナーTT2返信_新卒ホームに同一スレッド内で時系列表示される', async ({
    page,
  }) => {
    await loginAsTrainee(page);
    await openTraineeHome(page);
    await sendFreeTextMessage(page, E_M03_QUESTION_CONTENT);

    await logout(page);
    await loginAsTrainer(page);
    await openTrainerMessages(page);
    await openMessageThread(page, E_M03_QUESTION_CONTENT);
    await selectReplyTemplate(page, REPLY_TEMPLATE_TT2_LABEL);
    await sendTrainerReply(page);

    await logout(page);
    await loginAsTrainee(page);
    await openTraineeHome(page);
    await openMessageThread(page, E_M03_QUESTION_CONTENT);

    const history = messageThreadHistory(page);
    // 日付区切りも listitem になるため、吹き出し（article）で件数を見る（T-C）
    const messages = history.getByRole('article');

    await expect(history).toBeVisible();
    await expect(messages).toHaveCount(2);
    await expect(messages.nth(0)).toContainText(E_M03_QUESTION_CONTENT);
    await expect(messages.nth(1)).toContainText(REPLY_TEMPLATE_TT2_LABEL);
  });
});

/**
 * E-M04: スタンプ返信の送受信
 * 観点: CUJ / 連携 / 操作性
 *
 * 手順:
 * 1. 新卒がテンプレで質問送信
 * 2. トレーナーが当該スレッドを開きスタンプ ST1（👍 OK）をクリック
 * 3. 新卒で `/home` を確認
 *
 * 期待結果（表示）:
 * - 新卒側のスレッド履歴に、質問（TQ1）とスタンプ返信（ST1）が時系列で表示される
 *
 * 期待結果（データ）:
 * - スタンプ返信送信 API（POST /api/status/messages）が成功する
 */
test.describe('E-M04 スタンプ返信の送受信', () => {
  test('トレーナーST1スタンプ返信_新卒ホームのスレッド履歴に表示される', async ({
    page,
  }) => {
    await loginAsTrainee(page);
    await openTraineeHome(page);
    await sendFreeTextMessage(page, E_M04_QUESTION_CONTENT);

    await logout(page);
    await loginAsTrainer(page);
    await openTrainerMessages(page);
    await openMessageThread(page, E_M04_QUESTION_CONTENT);
    await sendTrainerStampReply(page, STAMP_ST1_LABEL);

    await logout(page);
    await loginAsTrainee(page);
    await openTraineeHome(page);
    await openMessageThread(page, E_M04_QUESTION_CONTENT);

    const history = messageThreadHistory(page);
    const messages = history.getByRole('article');

    await expect(history).toBeVisible();
    await expect(messages).toHaveCount(2);
    await expect(messages.nth(0)).toContainText(E_M04_QUESTION_CONTENT);
    await expect(messages.nth(1)).toContainText(STAMP_ST1_LABEL);
  });
});

/**
 * E-M05: トレーナーからの新規メッセージでスレッド作成
 * 観点: CUJ / 連携 / 操作性
 *
 * 手順:
 * 1. トレーナーで `/messages` を開き TT4 を選択して新規送信
 * 2. 新卒で `/home` を開く
 *
 * 期待結果（表示）:
 * - 新卒側のスレッド履歴に、トレーナーが送信した TT4 が表示される
 *
 * 期待結果（データ）:
 * - 新規メッセージ送信 API（POST /api/status/messages）が成功する
 */
test.describe('E-M05 トレーナーからの新規メッセージでスレッド作成', () => {
  test('トレーナーTT4新規送信_新卒ホームのスレッド履歴に表示される', async ({
    page,
  }) => {
    await loginAsTrainer(page);
    await openTrainerMessages(page);
    await selectTrainerNewMessageTemplate(page, REPLY_TEMPLATE_TT4_LABEL);
    await sendTrainerNewMessage(page);

    await logout(page);
    await loginAsTrainee(page);
    await openTraineeHome(page);
    await openMessageThread(page, REPLY_TEMPLATE_TT4_LABEL);

    const history = messageThreadHistory(page);
    const messages = history.getByRole('article');

    await expect(history).toBeVisible();
    await expect(messages).toHaveCount(1);
    await expect(messages.nth(0)).toContainText(REPLY_TEMPLATE_TT4_LABEL);
  });
});

/**
 * E-M06: 複数スレッドの表示
 * 観点: CUJ / 連携 / 操作性
 *
 * 手順:
 * 1. 新卒が TQ1 と TQ3 で別々に 2 回送信
 * 2. トレーナーで `/messages` を開く
 *
 * 期待結果（表示）:
 * - トレーナーのメッセージスレッド一覧に、TQ1 と TQ3 のスレッドがそれぞれ区別して表示される
 *
 * 期待結果（データ）:
 * - 各メッセージ送信 API（POST /api/status/messages）が成功する
 */
test.describe('E-M06 複数スレッドの表示', () => {
  test('新卒TQ1とTQ3別々送信_トレーナー画面に2スレッドが区別表示される', async ({
    page,
  }) => {
    await loginAsTrainee(page);
    await openTraineeHome(page);
    await selectQuestionTemplate(page, QUESTION_TEMPLATE_TQ1_LABEL);
    await sendSelectedMessage(page);
    await selectQuestionTemplate(page, QUESTION_TEMPLATE_TQ3_LABEL);
    await sendSelectedMessage(page);

    await logout(page);
    await loginAsTrainer(page);
    await openTrainerMessages(page);

    const threadList = messageThreadList(page);

    await expect(threadList).toBeVisible();
    await expect(
      messageThread(page, QUESTION_TEMPLATE_TQ1_LABEL).first(),
    ).toBeVisible();
    await expect(
      messageThread(page, QUESTION_TEMPLATE_TQ3_LABEL),
    ).toBeVisible();
  });
});

/**
 * E-M07: テンプレートドロップダウン UI
 * 観点: CUJ / 操作性
 *
 * 手順:
 * 1. 新卒で `/home` の送信領域を確認
 * 2. トレーナーで `/messages` の送信領域を確認
 *
 * 期待結果（表示）:
 * - 双方にテンプレート用 combobox があり、定義された 5 件が選択できること
 * - 双方に自由記述用 textbox があること
 *
 * 期待結果（データ）:
 * - なし（UI 確認のみ）
 */
test.describe('E-M07 テンプレートドロップダウン UI', () => {
  test('新卒とトレーナー送信領域にテンプレ5件と自由記述がある', async ({
    page,
  }) => {
    await loginAsTrainee(page);
    await openTraineeHome(page);

    const traineeSendRegion = messageSendRegion(page);
    await expect(traineeSendRegion).toBeVisible();
    await expectComboboxWithSelectableOptions(
      questionTemplateCombobox(page),
      QUESTION_TEMPLATE_LABELS,
    );
    await expect(freeTextInput(page)).toBeVisible();
    await expect(freeTextInput(page)).toBeEditable();

    await logout(page);
    await loginAsTrainer(page);
    await openTrainerMessages(page);

    const trainerSendRegion = trainerNewMessageRegion(page);
    await expect(trainerSendRegion).toBeVisible();
    await expectComboboxWithSelectableOptions(
      trainerMessageTemplateCombobox(page),
      REPLY_TEMPLATE_LABELS,
    );
    await expect(trainerFreeTextInput(page)).toBeVisible();
    await expect(trainerFreeTextInput(page)).toBeEditable();
  });
});

/**
 * E-M08: リアルタイム反映（手動リロード不要）
 * 観点: CUJ / 連携 / 操作性
 *
 * 手順:
 * 1. 新卒・トレーナーを別ブラウザコンテキストで同時に開く
 * 2. 新卒が TQ1 を送信
 * 3. トレーナー画面をリロードせず待機
 * 4. トレーナーが当該スレッドを開きスタンプ ST1 で返信
 * 5. 新卒画面もリロードせず待機
 *
 * 期待結果（表示）:
 * - 手順 3: トレーナーのスレッド一覧に新着メッセージが自動反映される
 * - 手順 5: 新卒のスレッド履歴にスタンプ返信が自動反映される
 *
 * 期待結果（データ）:
 * - 各送信 API（POST /api/status/messages）が成功する
 */
const E_M08_QUESTION_CONTENT = 'E-M08リアルタイム反映の確認です';

test.describe('E-M08 リアルタイム反映（手動リロード不要）', () => {
  test('新卒送信とトレーナースタンプ返信が相手画面に自動反映される', async ({
    browser,
  }) => {
    const traineeContext = await browser.newContext();
    const trainerContext = await browser.newContext();

    try {
      const traineePage = await traineeContext.newPage();
      const trainerPage = await trainerContext.newPage();

      await loginAsTrainee(traineePage);
      await openTraineeHome(traineePage);
      await loginAsTrainer(trainerPage);
      await openTrainerMessagesAndWaitForThreads(trainerPage);

      // 並列・連続 E2E でテンプレ文言が衝突しないよう固有の自由記述を使う
      await sendFreeTextMessage(traineePage, E_M08_QUESTION_CONTENT);
      await expect(
        messageThreadRoomHistory(traineePage)
          .getByRole('article')
          .filter({ hasText: E_M08_QUESTION_CONTENT }),
      ).toBeVisible({ timeout: REALTIME_UPDATE_TIMEOUT_MS });

      await expectRealtimeThreadOnTrainer(trainerPage, E_M08_QUESTION_CONTENT);

      await openMessageThread(trainerPage, E_M08_QUESTION_CONTENT);
      await sendTrainerStampReply(trainerPage, STAMP_ST1_LABEL);

      await expectRealtimeMessageInTraineeHistory(traineePage, STAMP_ST1_LABEL);

      const history = messageThreadRoomHistory(traineePage);
      const messages = history.getByRole('article');

      await expect(messages).toHaveCount(2, {
        timeout: REALTIME_UPDATE_TIMEOUT_MS,
      });
      await expect(messages.nth(0)).toContainText(E_M08_QUESTION_CONTENT);
      await expect(messages.nth(1)).toContainText(STAMP_ST1_LABEL);
    } finally {
      await traineeContext.close();
      await trainerContext.close();
    }
  });
});

/**
 * E-M09: 送信でホームにチャットルームが追加される
 * 観点: CUJ / 連携 / 操作性
 *
 * 手順:
 * 1. 新卒で `/home` を開き、ルーム一覧の件数を確認
 * 2. TQ1 を送信
 * 3. 一覧を再確認（リロードなし）
 *
 * 期待結果（表示）:
 * - ルームが 1 件増え、送信内容（TQ1）のプレビューが一覧に含まれる
 *
 * 期待結果（データ）:
 * - メッセージ送信 API（POST /api/status/messages）が成功する
 * - ルーム一覧 API（GET ...&view=threads）が成功する
 */
test.describe('E-M09 送信でホームにチャットルームが追加される', () => {
  test('新卒TQ1送信_ホームのルーム一覧がリロードなしで1件増えプレビューが表示される', async ({
    page,
  }) => {
    await loginAsTrainee(page);

    const threadsLoaded = waitForMessageThreadsLoaded(page);
    await openTraineeHome(page);
    await threadsLoaded;

    const threadList = messageThreadList(page);
    await expect(threadList).toBeVisible();

    // 共有 API の既存トーク件数に依存しないよう、固有プレビューの出現で追加を検証する
    const uniquePreview = `E-M09ルーム追加の確認-${Date.now()}`;
    await expect(messageThread(page, uniquePreview)).toHaveCount(0);

    await freeTextInput(page).fill(uniquePreview);
    await sendSelectedMessage(page);

    await expect(messageThread(page, uniquePreview).first()).toBeVisible({
      timeout: REALTIME_UPDATE_TIMEOUT_MS,
    });
  });
});

/**
 * E-M10: ホームのルームが新しい順に並ぶ
 * 観点: CUJ / 操作性 / 連携
 *
 * 手順:
 * 1. 新卒で `/home` を開く
 * 2. TQ1 を送信
 * 3. 続けて TQ3 を送信
 * 4. ルーム一覧を確認（リロードなし）
 *
 * 期待結果（表示）:
 * - 一覧の先頭が TQ3 のルーム、2 件目が TQ1 のルームであること（新しい順）
 *
 * 期待結果（データ）:
 * - 各メッセージ送信 API（POST /api/status/messages）が成功する
 * - ルーム一覧 API（GET ...&view=threads）が `updatedAt` 降順で返ること
 */
test.describe('E-M10 ホームのルームが新しい順に並ぶ', () => {
  test('新卒TQ1とTQ3送信後_ホームのルーム一覧が新しい順でTQ3が先頭', async ({
    page,
  }) => {
    await loginAsTrainee(page);

    const threadsLoaded = waitForMessageThreadsLoaded(page);
    await openTraineeHome(page);
    await threadsLoaded;

    await expect(messageThreadList(page)).toBeVisible();

    await selectQuestionTemplate(page, QUESTION_TEMPLATE_TQ1_LABEL);
    await sendSelectedMessage(page);

    await selectQuestionTemplate(page, QUESTION_TEMPLATE_TQ3_LABEL);
    await sendSelectedMessage(page);

    const articles = messageThreadArticles(page);

    await expect(articles.nth(0)).toHaveAttribute(
      'aria-label',
      QUESTION_TEMPLATE_TQ3_LABEL,
      { timeout: REALTIME_UPDATE_TIMEOUT_MS },
    );
    await expect(articles.nth(1)).toHaveAttribute(
      'aria-label',
      QUESTION_TEMPLATE_TQ1_LABEL,
    );
  });
});

/**
 * E-M11: LINE 風チャットルームでやり取り
 * 観点: CUJ / 操作性 / 連携
 *
 * 手順:
 * 1. 新卒で `/home` から既存ルームを開く
 * 2. 履歴と入力欄を確認
 * 3. 自由記述で追記送信
 *
 * 期待結果（表示）:
 * - LINE 風 UI（吹き出し・時系列）で過去メッセージと新規送信が表示されること
 *
 * 期待結果（データ）:
 * - 初回送信・追記送信 API（POST /api/status/messages）が成功する
 * - 追記は同一 threadId のルームに追加されること
 */
test.describe('E-M11 LINE 風チャットルームでやり取り', () => {
  test('既存ルームを開き自由記述追記_吹き出し時系列で過去と新規が表示される', async ({
    page,
  }) => {
    await loginAsTrainee(page);

    const threadsLoaded = waitForMessageThreadsLoaded(page);
    await openTraineeHome(page);
    await threadsLoaded;

    await sendFreeTextMessage(page, E_M11_INITIAL_MESSAGE);
    await openMessageThread(page, E_M11_INITIAL_MESSAGE);

    await expect(messageThreadDetail(page)).toBeVisible();

    const history = messageThreadRoomHistory(page);
    const bubbles = messageThreadBubbles(page);

    await expect(history).toBeVisible();
    await expect(bubbles).toHaveCount(1, {
      timeout: REALTIME_UPDATE_TIMEOUT_MS,
    });
    await expect(bubbles.nth(0)).toContainText(E_M11_INITIAL_MESSAGE);

    const threadSendRegion = traineeThreadRoomSendRegion(page);
    await expect(threadSendRegion).toBeVisible();
    await expect(
      threadSendRegion.getByRole('textbox', { name: '自由記述' }),
    ).toBeVisible();
    await expect(
      threadSendRegion.getByRole('button', { name: '送信' }),
    ).toBeVisible();

    await sendFollowUpInThreadRoom(page, E_M11_FOLLOW_UP_MESSAGE);

    await expect(bubbles).toHaveCount(2, {
      timeout: REALTIME_UPDATE_TIMEOUT_MS,
    });
    await expect(bubbles.nth(0)).toContainText(E_M11_INITIAL_MESSAGE);
    await expect(bubbles.nth(1)).toContainText(E_M11_FOLLOW_UP_MESSAGE);
  });
});

/**
 * E-M12: Slack 風スタンプバーの配置
 * 観点: CUJ / 操作性
 *
 * 手順:
 * 1. 新卒でルーム詳細を開く
 * 2. トレーナーで同一ルームを開く
 *
 * 期待結果（表示）:
 * - 双方の入力欄付近にスタンプが横並びで表示されること
 * - レガシー「後で話そう」ボタンは存在しないこと
 */
test.describe('E-M12 Slack 風スタンプバーの配置', () => {
  test('双方のルーム詳細に横並びスタンプバーがあり後で話そうボタンは存在しない', async ({
    page,
  }) => {
    await loginAsTrainee(page);

    const threadsLoaded = waitForMessageThreadsLoaded(page);
    await openTraineeHome(page);
    await threadsLoaded;

    await sendFreeTextMessage(page, E_M12_QUESTION_CONTENT);
    await openMessageThread(page, E_M12_QUESTION_CONTENT);

    await expect(messageThreadDetail(page)).toBeVisible();
    await expectHorizontalStampBar(
      traineeThreadStampReplyRegion(page),
      TRAINEE_STAMP_LABELS,
    );
    await expectLegacyReplyStampAbsent(page);

    await logout(page);
    await loginAsTrainer(page);
    await openTrainerMessagesAndWaitForThreads(page);
    await openMessageThread(page, E_M12_QUESTION_CONTENT);

    await expect(messageThreadDetail(page)).toBeVisible();
    await expectHorizontalStampBar(
      trainerThreadStampReplyRegion(page),
      TRAINER_STAMP_LABELS,
    );
    await expectLegacyReplyStampAbsent(page);
  });
});

/**
 * E-M13: 新卒が敬語スタンプで返信
 * 観点: CUJ / 連携 / 操作性
 *
 * 手順:
 * 1. 新卒が質問を送信し、トレーナーが当該ルームで TT2 で返信する
 * 2. 新卒が同一ルームを開き STS1（🙇 ありがとうございます）をクリック
 * 3. トレーナー画面を確認（リロードなし）
 *
 * 期待結果（表示）:
 * - 新卒側ルーム履歴に STS1 が表示されること
 * - トレーナー側ルームにも STS1 が反映されること
 *
 * 期待結果（データ）:
 * - スタンプ返信送信 API（POST /api/status/messages）が成功する
 * - 同一 threadId に `type: stamp`・`stampId: STS1` が追加されること
 */
test.describe('E-M13 新卒が敬語スタンプで返信', () => {
  test('新卒STS1スタンプ返信_双方のルーム履歴に敬語スタンプが表示される', async ({
    browser,
  }) => {
    const traineeContext = await browser.newContext();
    const trainerContext = await browser.newContext();

    try {
      const traineePage = await traineeContext.newPage();
      const trainerPage = await trainerContext.newPage();

      await loginAsTrainee(traineePage);
      await openTraineeHome(traineePage);
      await sendFreeTextMessage(traineePage, E_M13_QUESTION_CONTENT);

      await loginAsTrainer(trainerPage);
      await openTrainerMessagesAndWaitForThreads(trainerPage);
      await openMessageThread(trainerPage, E_M13_QUESTION_CONTENT);
      await selectReplyTemplate(trainerPage, REPLY_TEMPLATE_TT2_LABEL);
      await sendTrainerReply(trainerPage);

      await openMessageThread(traineePage, E_M13_QUESTION_CONTENT);
      await expect(messageThreadDetail(traineePage)).toBeVisible();
      await expectHorizontalStampBar(
        traineeThreadStampReplyRegion(traineePage),
        TRAINEE_STAMP_LABELS,
      );

      await sendTraineeStampReply(traineePage, TRAINEE_STAMP_STS1_LABEL);

      const traineeBubbles = messageThreadBubbles(traineePage);

      await expect(traineeBubbles).toHaveCount(3, {
        timeout: REALTIME_UPDATE_TIMEOUT_MS,
      });
      await expect(traineeBubbles.nth(0)).toContainText(E_M13_QUESTION_CONTENT);
      await expect(traineeBubbles.nth(1)).toContainText(
        REPLY_TEMPLATE_TT2_LABEL,
      );
      await expect(traineeBubbles.nth(2)).toContainText(
        TRAINEE_STAMP_STS1_LABEL,
      );

      await expectRealtimeMessageInTrainerThreadHistory(
        trainerPage,
        TRAINEE_STAMP_STS1_LABEL,
      );
    } finally {
      await traineeContext.close();
      await trainerContext.close();
    }
  });
});

/**
 * E-M14: メッセージの送信者表示（LINE 風）
 * 観点: CUJ / 操作性 / 連携
 *
 * 手順:
 * 1. 新卒が質問を送信し、トレーナーが当該ルームで TT2 で返信
 * 2. 新卒で当該ルームを開く
 * 3. トレーナーでも同一ルームを開く
 *
 * 期待結果（表示）:
 * - 新卒画面で自分のメッセージが右寄せ、トレーナーの返信が左寄せかつ「トレーナー」等の名前が見えること
 * - トレーナー画面では自分の返信が右寄せ、新卒の質問が左寄せかつ「新卒」等の名前が見えること
 *
 * 期待結果（データ）:
 * - 質問・返信送信 API（POST /api/status/messages）が成功する
 * - 同一 threadId の履歴に 2 件のメッセージが保存されること
 */
test.describe('E-M14 メッセージの送信者表示（LINE 風）', () => {
  test('双方のルーム詳細で自分は右寄せ相手は左寄せかつ送信者名が表示される', async ({
    page,
  }) => {
    await loginAsTrainee(page);
    await openTraineeHome(page);
    await sendFreeTextMessage(page, E_M14_QUESTION_CONTENT);

    await logout(page);
    await loginAsTrainer(page);
    await openTrainerMessages(page);
    await openMessageThread(page, E_M14_QUESTION_CONTENT);
    await selectReplyTemplate(page, REPLY_TEMPLATE_TT2_LABEL);
    await sendTrainerReply(page);

    await logout(page);
    await loginAsTrainee(page);
    await openTraineeHome(page);
    await openMessageThread(page, E_M14_QUESTION_CONTENT);

    await expect(messageThreadDetail(page)).toBeVisible();

    const traineeHistory = messageThreadRoomHistory(page);
    const traineeSelfBubble = messageThreadSenderBubble(
      page,
      'self',
      E_M14_QUESTION_CONTENT,
    );
    const traineeOtherBubble = messageThreadSenderBubble(
      page,
      'other',
      REPLY_TEMPLATE_TT2_LABEL,
    );

    await expect(traineeSelfBubble).toBeVisible();
    await expect(traineeOtherBubble).toBeVisible();
    await expect(
      messageThreadSenderName(
        page,
        MESSAGE_SENDER_SELF_LABEL,
        E_M14_QUESTION_CONTENT,
      ),
    ).toBeVisible();
    await expect(
      messageThreadSenderName(
        page,
        MESSAGE_SENDER_TRAINER_LABEL,
        REPLY_TEMPLATE_TT2_LABEL,
      ),
    ).toBeVisible();
    await expectBubbleAlignedRight(traineeSelfBubble, traineeHistory);
    await expectBubbleAlignedLeft(traineeOtherBubble, traineeHistory);

    await logout(page);
    await loginAsTrainer(page);
    await openTrainerMessages(page);
    await openMessageThread(page, E_M14_QUESTION_CONTENT);

    await expect(messageThreadDetail(page)).toBeVisible();

    const trainerHistory = messageThreadRoomHistory(page);
    const trainerSelfBubble = messageThreadSenderBubble(
      page,
      'self',
      REPLY_TEMPLATE_TT2_LABEL,
    );
    const trainerOtherBubble = messageThreadSenderBubble(
      page,
      'other',
      E_M14_QUESTION_CONTENT,
    );

    await expect(trainerSelfBubble).toBeVisible();
    await expect(trainerOtherBubble).toBeVisible();
    await expect(
      messageThreadSenderName(
        page,
        MESSAGE_SENDER_SELF_LABEL,
        REPLY_TEMPLATE_TT2_LABEL,
      ),
    ).toBeVisible();
    await expect(
      messageThreadSenderName(
        page,
        MESSAGE_SENDER_TRAINEE_LABEL,
        E_M14_QUESTION_CONTENT,
      ),
    ).toBeVisible();
    await expectBubbleAlignedRight(trainerSelfBubble, trainerHistory);
    await expectBubbleAlignedLeft(trainerOtherBubble, trainerHistory);
  });
});

/**
 * E-M15: ルーム一覧に最終やり取り日時を表示
 * 観点: CUJ / 連携 / 操作性
 *
 * 手順:
 * 1. 新卒で TQ1 を送信（送信直後の日時を記録）
 * 2. `/home` のルーム一覧を確認
 * 3. トレーナーで `/messages` の一覧も確認
 *
 * 期待結果（表示）:
 * - 当該ルーム行に送信日時と一致する `YYYY年M月D日 H:mm` 形式の日時が表示されること（新卒・トレーナー双方）
 *
 * 期待結果（データ）:
 * - メッセージ送信 API（POST /api/status/messages）が成功する
 * - ルーム一覧 API（GET ...&view=threads）の `thread.updatedAt` が直近メッセージ時刻と一致すること
 */
test.describe('E-M15 ルーム一覧に最終やり取り日時を表示', () => {
  test('新卒TQ1送信後_双方のルーム一覧に送信日時がYYYY年M月D日H:mm形式で表示される', async ({
    page,
  }) => {
    await loginAsTrainee(page);

    const threadsLoaded = waitForMessageThreadsLoaded(page);
    await openTraineeHome(page);
    await threadsLoaded;

    await selectQuestionTemplate(page, QUESTION_TEMPLATE_TQ1_LABEL);
    await sendSelectedMessage(page);
    const sentAt = new Date();

    await expect(messageThreadList(page)).toBeVisible();
    await expect(
      messageThread(page, QUESTION_TEMPLATE_TQ1_LABEL).first(),
    ).toBeVisible();
    await expectMessageThreadUpdatedAt(
      page,
      QUESTION_TEMPLATE_TQ1_LABEL,
      sentAt,
    );

    await logout(page);
    await loginAsTrainer(page);
    await openTrainerMessagesAndWaitForThreads(page);

    await expect(
      messageThread(page, QUESTION_TEMPLATE_TQ1_LABEL).first(),
    ).toBeVisible();
    await expectMessageThreadUpdatedAt(
      page,
      QUESTION_TEMPLATE_TQ1_LABEL,
      sentAt,
    );
  });
});

/**
 * E-M16: ルーム開封時にチャット欄下端へ視点固定
 * 観点: CUJ / 操作性 / 連携
 *
 * 手順:
 * 1. 新卒が質問を送信し、トレーナーが TT2 で返信
 * 2. 新卒で当該ルームを開く
 * 3. トレーナーでも同一ルームを開く
 *
 * 期待結果（表示）:
 * - 双方ともルーム開封直後に最新メッセージ（TT2）が表示範囲内にあること
 * - 履歴コンテナ（role="log"）のスクロール位置が最下部であること
 *
 * 期待結果（データ）:
 * - 質問・返信送信 API（POST /api/status/messages）が成功する
 * - ルーム詳細 API（GET ...&view=thread）が時系列で履歴を返すこと
 *
 * 備考: 履歴がスクロール領域を超えるよう長文質問を用い、下端固定の検証を安定化する
 */
test.describe('E-M16 ルーム開封時にチャット欄下端へ視点固定', () => {
  test('双方がルーム開封直後に最新メッセージが表示範囲内かつ履歴が最下部にスクロールされる', async ({
    page,
  }) => {
    await loginAsTrainee(page);
    await openTraineeHome(page);
    await sendFreeTextMessage(page, E_M16_QUESTION_CONTENT);

    await logout(page);
    await loginAsTrainer(page);
    await openTrainerMessages(page);
    await openMessageThread(page, E_M16_QUESTION_CONTENT);
    await selectReplyTemplate(page, REPLY_TEMPLATE_TT2_LABEL);
    await sendTrainerReply(page);

    await logout(page);
    await loginAsTrainee(page);
    await openTraineeHome(page);
    await openMessageThread(page, E_M16_QUESTION_CONTENT);

    await expect(messageThreadDetail(page)).toBeVisible();

    const traineeHistory = messageThreadRoomHistory(page);
    const traineeLatestBubble = messageThreadSenderBubble(
      page,
      'other',
      REPLY_TEMPLATE_TT2_LABEL,
    );

    await expect(traineeLatestBubble).toBeVisible();
    await expect
      .poll(
        async () => {
          try {
            await expectMessageThreadHistoryScrolledToBottom(traineeHistory);
            await expectMessageBubbleWithinHistoryViewport(
              traineeHistory,
              traineeLatestBubble,
            );
            return true;
          } catch {
            return false;
          }
        },
        { timeout: REALTIME_UPDATE_TIMEOUT_MS },
      )
      .toBe(true);

    await logout(page);
    await loginAsTrainer(page);
    await openTrainerMessages(page);
    await openMessageThread(page, E_M16_QUESTION_CONTENT);

    await expect(messageThreadDetail(page)).toBeVisible();

    const trainerHistory = messageThreadRoomHistory(page);
    const trainerLatestBubble = messageThreadSenderBubble(
      page,
      'self',
      REPLY_TEMPLATE_TT2_LABEL,
    );

    await expect(trainerLatestBubble).toBeVisible();
    await expect
      .poll(
        async () => {
          try {
            await expectMessageThreadHistoryScrolledToBottom(trainerHistory);
            await expectMessageBubbleWithinHistoryViewport(
              trainerHistory,
              trainerLatestBubble,
            );
            return true;
          } catch {
            return false;
          }
        },
        { timeout: REALTIME_UPDATE_TIMEOUT_MS },
      )
      .toBe(true);
  });
});

/**
 * E-M17 スレッド一覧インライン展開（R-M17）
 *
 * シリアル実行の前テスト状態を引き継がないよう、各ケース前にページをリロードする。
 */
test.describe('E-M17 スレッド一覧インライン展開', () => {
  test.beforeEach(async ({ page }) => {
    await page.reload({ waitUntil: 'domcontentloaded' });
  });

  /**
   * E-M17: ルーム選択で直下にチャット欄が開き履歴が表示される
   * 観点: CUJ / 操作性 / 連携
   * 対応: TC-MSG-UI-001〜006, TC-MSG-UI-010
   *
   * 手順:
   * 1. 新卒でスレッド2件以上を用意
   * 2. 2件目のルーム行をクリック
   *
   * 期待結果（表示）:
   * - 選択行の DOM 直後に `role="region"`（スレッド詳細）が下方向展開で表示される
   * - `role="log"` に履歴が表示される
   * - 選択行のみ選択色（`aria-selected="true"`）
   */
  test.describe('E-M17 ルーム選択で直下にチャット欄が開き履歴が表示される', () => {
    test('ルーム行選択_直下に詳細が開き履歴表示と選択色が付く', async ({
      page,
    }) => {
      await loginAsTrainee(page);

      const threadsLoaded = waitForMessageThreadsLoaded(page);
      await openTraineeHome(page);
      await threadsLoaded;

      await sendFreeTextMessage(page, E_M17_THREAD_A_CONTENT);
      await sendFreeTextMessage(page, E_M17_THREAD_B_CONTENT);

      await expectInlineDetailOpensWithExpandingHeight(
        page,
        E_M17_THREAD_B_CONTENT,
      );
      await expectInlineDetailOpenAfterRow(page, E_M17_THREAD_B_CONTENT);
      await expectMessageThreadRowSelected(page, E_M17_THREAD_B_CONTENT);
      await expectMessageThreadRowNotSelected(page, E_M17_THREAD_A_CONTENT);
      await expect(
        inlineMessageThreadDetailAfterRow(page, E_M17_THREAD_B_CONTENT)
          .getByRole('log', { name: 'スレッド履歴' })
          .getByRole('article')
          .filter({ hasText: E_M17_THREAD_B_CONTENT }),
      ).toBeVisible();
    });

    test('先頭ルーム選択_先頭li直後に詳細が表示される', async ({ page }) => {
      await loginAsTrainee(page);

      const threadsLoaded = waitForMessageThreadsLoaded(page);
      await openTraineeHome(page);
      await threadsLoaded;

      await sendFreeTextMessage(page, E_M17_THREAD_A_CONTENT);
      await sendFreeTextMessage(page, E_M17_THREAD_B_CONTENT);

      await clickMessageThreadRowAndWaitForHistory(
        page,
        E_M17_THREAD_B_CONTENT,
      );
      await expectInlineDetailOpenAfterRow(page, E_M17_THREAD_B_CONTENT);
    });

    test('末尾ルーム選択_末尾li直後に詳細が表示される', async ({ page }) => {
      await loginAsTrainee(page);

      const threadsLoaded = waitForMessageThreadsLoaded(page);
      await openTraineeHome(page);
      await threadsLoaded;

      await sendFreeTextMessage(page, E_M17_THREAD_A_CONTENT);
      await sendFreeTextMessage(page, E_M17_THREAD_B_CONTENT);

      await clickMessageThreadRowAndWaitForHistory(
        page,
        E_M17_THREAD_A_CONTENT,
        'last',
      );
      await expectInlineDetailOpenAfterRow(
        page,
        E_M17_THREAD_A_CONTENT,
        'last',
      );
    });
  });

  /**
   * E-M17-02 → E-SV06: 同一ルーム再クリックでも選択維持（BR-SV09）
   */
  test.describe('E-SV06 同一ルーム再クリックで選択維持', () => {
    test('選択中ルーム再クリック_詳細と選択状態を維持する', async ({
      page,
    }) => {
      await loginAsTrainee(page);

      const threadsLoaded = waitForMessageThreadsLoaded(page);
      await openTraineeHome(page);
      await threadsLoaded;

      await sendFreeTextMessage(page, E_M17_THREAD_A_CONTENT);

      await clickMessageThreadRowAndWaitForHistory(
        page,
        E_M17_THREAD_A_CONTENT,
      );
      await expectInlineDetailOpenAfterRow(page, E_M17_THREAD_A_CONTENT);
      await expectMessageThreadRowSelected(page, E_M17_THREAD_A_CONTENT);

      await clickMessageThreadRow(page, E_M17_THREAD_A_CONTENT);

      await expectOpenInlineDetailsCount(page, 1);
      await expectInlineDetailOpenAfterRow(page, E_M17_THREAD_A_CONTENT);
      await expectMessageThreadRowSelected(page, E_M17_THREAD_A_CONTENT);
    });
  });

  /**
   * E-M17-03: トグル閉じは廃止（BR-SV09）。再クリック維持は E-SV06 で担保。
   */
  test.describe('E-M17-03 閉じた後に再オープンできる', () => {
    test.skip('閉状態から再クリック_開くアニメーションで履歴が再表示される', async () => {
      // スプリットビューでは選択解除しないため不要
    });
  });

  /**
   * E-M17-04: 別ルーム選択時は閉じてから開く
   * 観点: CUJ / 操作性
   * 対応: TC-MSG-UI-007, TC-MSG-UI-011, TC-MSG-UI-014, TC-MSG-UI-024
   */
  test.describe('E-M17-04 別ルーム選択時は閉じてから開く', () => {
    test('ルームA表示中にルームB選択_B直下に1つだけ開きBのみ選択色', async ({
      page,
    }) => {
      await loginAsTrainee(page);

      const threadsLoaded = waitForMessageThreadsLoaded(page);
      await openTraineeHome(page);
      await threadsLoaded;

      await sendFreeTextMessage(page, E_M17_THREAD_A_CONTENT);
      await sendFreeTextMessage(page, E_M17_THREAD_B_CONTENT);
      await clickMessageThreadRowAndWaitForHistory(
        page,
        E_M17_THREAD_A_CONTENT,
      );

      await expectInlineDetailSwitchBetweenRows(
        page,
        E_M17_THREAD_A_CONTENT,
        E_M17_THREAD_B_CONTENT,
      );
    });
  });

  /**
   * E-M17-05: スレッド0件は空状態のみ
   * 観点: 異常系 / 境界値
   * 対応: TC-MSG-UI-012
   */
  test.describe('E-M17-05 スレッド0件は空状態のみ', () => {
    test('スレッド0件_クリック可能なルーム行とチャット欄がない', async ({
      page,
    }) => {
      await mockEmptyMessageThreadList(page);
      await loginAsTrainee(page);
      await openTraineeHome(page);

      await expect(messageThreadList(page)).toBeVisible();
      await expect(messageThreadArticles(page)).toHaveCount(0);
      await expect(openInlineMessageThreadDetails(page)).toHaveCount(0);
      await expect(
        page.getByText('メッセージを送信してください'),
      ).toBeVisible();
    });
  });

  /**
   * E-M17-06: 履歴取得失敗時にエラーメッセージ
   * 観点: 異常系 / 連携
   * 対応: TC-MSG-UI-015
   */
  test.describe('E-M17-06 履歴取得失敗時にエラーメッセージ', () => {
    test('履歴APIエラー時_エラーメッセージ表示しクラッシュしない', async ({
      page,
    }) => {
      await loginAsTrainee(page);

      const threadsLoaded = waitForMessageThreadsLoaded(page);
      await openTraineeHome(page);
      await threadsLoaded;

      await sendFreeTextMessage(page, E_M17_THREAD_A_CONTENT);
      await mockMessageThreadHistoryFailure(page);

      await clickMessageThreadRow(page, E_M17_THREAD_A_CONTENT);

      await expect(messageThreadHistoryError(page)).toBeVisible();
      await expect(messageThreadHistoryError(page)).toHaveText(
        MESSAGE_THREAD_HISTORY_ERROR_PATTERN,
      );
      await expect(page.getByRole('heading', { name: 'ホーム' })).toBeVisible();
    });
  });

  /**
   * E-M17-07: 新卒・トレーナー双方で同一挙動
   * 観点: CUJ / 操作性
   * 対応: TC-MSG-UI-021
   */
  test.describe('E-M17-07 新卒・トレーナー双方で同一挙動', () => {
    test('新卒画面で開閉と別ルーム切替が仕様どおり動作する', async ({
      page,
    }) => {
      await loginAsTrainee(page);

      const threadsLoaded = waitForMessageThreadsLoaded(page);
      await openTraineeHome(page);
      await threadsLoaded;

      await sendFreeTextMessage(page, E_M17_THREAD_A_CONTENT);
      await sendFreeTextMessage(page, E_M17_THREAD_B_CONTENT);

      await assertInlineOpenCloseAndSwitchBehavior(
        page,
        E_M17_THREAD_A_CONTENT,
        E_M17_THREAD_B_CONTENT,
      );
    });

    test('トレーナー画面で開閉と別ルーム切替が仕様どおり動作する', async ({
      page,
    }) => {
      await loginAsTrainee(page);
      await openTraineeHome(page);
      await sendFreeTextMessage(page, E_M17_THREAD_A_CONTENT);
      await sendFreeTextMessage(page, E_M17_THREAD_B_CONTENT);

      await logout(page);
      await loginAsTrainer(page);

      const threadsLoaded = waitForMessageThreadsLoaded(page);
      await openTrainerMessages(page);
      await threadsLoaded;

      await assertInlineOpenCloseAndSwitchBehavior(
        page,
        E_M17_THREAD_A_CONTENT,
        E_M17_THREAD_B_CONTENT,
      );
    });
  });

  /**
   * E-M17-08: 一覧20件境界（20件目・21件目）
   * 観点: 境界値 / 操作性
   * 対応: TC-MSG-UI-018〜020
   */
  test.describe('E-M17-08 一覧20件境界（20件目・21件目）', () => {
    test('21件表示時_20件目と21件目の直後にそれぞれ詳細が開く', async ({
      page,
    }) => {
      await loginAsTrainee(page);

      const threadsLoaded = waitForMessageThreadsLoaded(page);
      await openTraineeHome(page);
      await threadsLoaded;

      const previews = await seedTraineeFreeTextThreads(
        page,
        MESSAGE_THREAD_LIST_PAGE_SIZE + 1,
        E_M17_PAGING_PREFIX,
      );

      await expect(messageThreadArticles(page)).toHaveCount(
        MESSAGE_THREAD_LIST_PAGE_SIZE,
      );

      const twentiethVisiblePreview = previews[1];
      const twentyFirstOverallPreview = previews[0];

      await clickMessageThreadRowAndWaitForHistory(
        page,
        twentiethVisiblePreview,
      );
      await expectInlineDetailOpenAfterRow(page, twentiethVisiblePreview);

      await clickMessageThreadRow(page, twentiethVisiblePreview);
      await expectInlineDetailOpenAfterRow(page, twentiethVisiblePreview);

      await goToMessageThreadListPageContaining(
        page,
        twentyFirstOverallPreview,
      );

      await clickMessageThreadRowAndWaitForHistory(
        page,
        twentyFirstOverallPreview,
      );
      await expectInlineDetailOpenAfterRow(page, twentyFirstOverallPreview);
    });

    test('21件表示時_1ページ目先頭選択でページングと干渉しない', async ({
      page,
    }) => {
      await loginAsTrainee(page);

      const threadsLoaded = waitForMessageThreadsLoaded(page);
      await openTraineeHome(page);
      await threadsLoaded;

      const previews = await seedTraineeFreeTextThreads(
        page,
        MESSAGE_THREAD_LIST_PAGE_SIZE + 1,
        E_M17_PAGING_PREFIX,
      );
      const newestPreview = previews[MESSAGE_THREAD_LIST_PAGE_SIZE];

      await clickMessageThreadRowAndWaitForHistory(page, newestPreview);
      await expectInlineDetailOpenAfterRow(page, newestPreview);
      await expect(messageThreadArticles(page)).toHaveCount(
        MESSAGE_THREAD_LIST_PAGE_SIZE,
      );
    });
  });
});
