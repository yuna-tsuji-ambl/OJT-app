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
    const messages = history.getByRole('listitem');

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
    const messages = history.getByRole('listitem');

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
    const messages = history.getByRole('listitem');

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

      const threadsBefore = await messageThreadArticles(trainerPage).count();

      await selectQuestionTemplate(traineePage, QUESTION_TEMPLATE_TQ1_LABEL);
      await sendSelectedMessage(traineePage);

      await expect(messageThreadArticles(trainerPage)).toHaveCount(
        threadsBefore + 1,
        { timeout: REALTIME_UPDATE_TIMEOUT_MS },
      );
      await expectRealtimeThreadOnTrainer(
        trainerPage,
        QUESTION_TEMPLATE_TQ1_LABEL,
      );

      await openMessageThread(trainerPage, QUESTION_TEMPLATE_TQ1_LABEL);
      await sendTrainerStampReply(trainerPage, STAMP_ST1_LABEL);

      await expectRealtimeMessageInTraineeHistory(traineePage, STAMP_ST1_LABEL);

      const history = messageThreadHistory(traineePage);
      const messages = history.getByRole('listitem');

      await expect(messages).toHaveCount(2, {
        timeout: REALTIME_UPDATE_TIMEOUT_MS,
      });
      await expect(messages.nth(0)).toContainText(QUESTION_TEMPLATE_TQ1_LABEL);
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

    const threadsBefore = await messageThreadArticles(page).count();

    await selectQuestionTemplate(page, QUESTION_TEMPLATE_TQ1_LABEL);
    await sendSelectedMessage(page);

    await expect(messageThreadArticles(page)).toHaveCount(threadsBefore + 1, {
      timeout: REALTIME_UPDATE_TIMEOUT_MS,
    });
    await expect(
      messageThread(page, QUESTION_TEMPLATE_TQ1_LABEL).first(),
    ).toBeVisible();
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
