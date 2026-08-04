import { expect, test } from '@playwright/test';
import {
  loginAsTrainee,
  loginAsTrainer,
  logout,
} from './helpers/playwright-auth';
import {
  applyDailyReportListFilter,
  applyWeeklyReportListFilter,
  buildPastDailyReportsOldestFirst,
  expectDailyReportFieldValues,
  expectDashboardHasNoReportListLink,
  expectLegacyReportPathRedirectsToReports,
  expectPastDailyReportPeriodKeysNotVisible,
  expectPastDailyReportPeriodKeysVisible,
  expectPastDailyReportsNewestFirst,
  expectPastWeeklyReportPeriodKeysNotVisible,
  expectPastWeeklyReportPeriodKeysVisible,
  expectReportCommentNotVisible,
  expectReportCommentVisible,
  expectReportListFilterConflictError,
  expectReportResponseStatus,
  expectTraineeReportsPageWithFormsAndLinks,
  expectTrainerDailyReportContent,
  expectTrainerReportCount,
  expectTrainerWeeklyReportContent,
  expectWeeklyReportFieldValues,
  fillDailyReportFields,
  fillReportListFilter,
  fillWeeklyReportFields,
  filterTrainerReportsByType,
  formatDailyReportPeriodKey,
  formatDailyReportPeriodKeyDaysAgo,
  formatWeeklyReportPeriodKey,
  formatWeeklyReportPeriodKeyWeeksAgo,
  navigateBackToTraineeHome,
  navigateFromReportsPageToDailyReportList,
  navigateFromTrainerDashboardToReportList,
  navigateFromTraineeHomeToReports,
  openDailyReportListPage,
  openDailyReportPage,
  openReportDetailPage,
  openReportListPage,
  openTrainerReportDetail,
  openTraineeHomePage,
  openTrainerDashboardPage,
  openWeeklyReportListPage,
  openWeeklyReportPage,
  putTraineeDailyReportViaApi,
  putTraineeWeeklyReportViaApi,
  REPORT_LIST_WEEKLY_DATE_LABEL,
  REPORT_TYPE_FILTER_VALUE_DAILY,
  DAILY_REPORT_LEGACY_PATH,
  WEEKLY_REPORT_LEGACY_PATH,
  saveDailyReportDraft,
  seedPastDailyReportsViaApi,
  startEditTrainerReportComment,
  submitDailyReport,
  submitDailyReportExpectingValidationError,
  submitReportListFilter,
  submitTrainerReportComment,
  submitWeeklyReport,
  trainerReportCard,
  updateTrainerReportComment,
  type DailyReportFieldValues,
  type PartialDailyReportFieldValues,
  type SeededPastDailyReport,
  type SeededPastWeeklyReport,
  type WeeklyReportFieldValues,
} from './helpers/report';
import {
  expectCiWorkflowRunsVitestAndPlaywright,
  expectReportE2eAutomationTargetsPresent,
  expectReportFeatureVitestSuitesPass,
  REPORT_CI_GATE_TIMEOUT_MS,
} from './helpers/reportCi';

/** E-R01: 下書き用の一部項目 */
const E_R01_PARTIAL_DAILY_VALUES = {
  doneToday: 'E-R01 本日やったこと（下書き）',
  learnedToday: 'E-R01 学んだこと（下書き）',
} as const satisfies PartialDailyReportFieldValues;

/** E-R01: 提出前に埋める残り項目 */
const E_R01_REMAINING_DAILY_VALUES = {
  blockers: 'E-R01 困っていること',
  planTomorrow: 'E-R01 明日やること',
} as const satisfies PartialDailyReportFieldValues;

const E_R01_FULL_DAILY_VALUES = {
  ...E_R01_PARTIAL_DAILY_VALUES,
  ...E_R01_REMAINING_DAILY_VALUES,
} as const satisfies DailyReportFieldValues;

// 同一 trainee・同一日/週は 1 件制約のため、ファイル内は直列実行する
test.describe('報告書 E2E', () => {
  test.describe.configure({ mode: 'serial' });

  /**
   * E-R01: 日次報告の下書き保存から提出まで
   * 観点: CUJ / 連携 / 操作性
   *
   * 手順:
   * 1. 新卒で `/reports/daily` を開く
   * 2. 一部項目を入力し下書き保存
   * 3. 残りを入力し提出
   *
   * 期待結果（表示）:
   * - 下書き保存後に再表示すると入力内容が復元される
   * - 提出成功のフィードバックが表示される
   *
   * 期待結果（データ）:
   * - 提出後の PUT レスポンスで `status=submitted` となる
   *
   * 参照: docs/test-specs/report-feature.md E-R01
   */
  test.describe('E-R01 日次報告の下書き保存から提出まで', () => {
    test('一部入力で下書き保存後に復元し_残り入力して提出するとstatusがsubmittedになる', async ({
      page,
    }) => {
      await loginAsTrainee(page);
      await openDailyReportPage(page);

      await fillDailyReportFields(page, E_R01_PARTIAL_DAILY_VALUES);
      const draftResponse = await saveDailyReportDraft(page);
      await expectReportResponseStatus(draftResponse, 'draft');

      await openDailyReportPage(page);
      await expectDailyReportFieldValues(page, E_R01_PARTIAL_DAILY_VALUES);

      await fillDailyReportFields(page, E_R01_REMAINING_DAILY_VALUES);
      await expectDailyReportFieldValues(page, E_R01_FULL_DAILY_VALUES);

      const submitResponse = await submitDailyReport(page);
      await expectReportResponseStatus(submitResponse, 'submitted');
    });
  });

  /** E-R02: 提出する日次報告の全項目 */
  const E_R02_DAILY_VALUES = {
    doneToday: 'E-R02 本日やったこと',
    learnedToday: 'E-R02 学んだこと',
    blockers: 'E-R02 困っていること',
    planTomorrow: 'E-R02 明日やること',
  } as const satisfies DailyReportFieldValues;

  /**
   * E-R02: 新卒の日次報告作成からトレーナー閲覧まで
   * 観点: CUJ / 連携 / 操作性
   *
   * 手順:
   * 1. 新卒で `/reports/daily` から全項目入力・提出
   * 2. ログアウトしトレーナーで `/reports` を開く
   * 3. 当該日の日次報告を確認
   *
   * 期待結果（表示）:
   * - トレーナーの報告書一覧に新卒の日次報告が表示される
   * - 各項目（本日やったこと / 学んだこと / 困っていること / 明日やること）の内容が一致する
   *
   * 期待結果（データ）:
   * - 提出時の PUT レスポンスで `status=submitted` となる
   *
   * 参照: docs/test-specs/report-feature.md E-R02
   */
  test.describe('E-R02 新卒の日次報告作成からトレーナー閲覧まで', () => {
    test('新卒が日次報告を提出_トレーナー一覧で全項目の内容が一致する', async ({
      page,
    }) => {
      const periodKey = formatDailyReportPeriodKey();

      await loginAsTrainee(page);
      await openDailyReportPage(page);
      await fillDailyReportFields(page, E_R02_DAILY_VALUES);

      const submitResponse = await submitDailyReport(page);
      await expectReportResponseStatus(submitResponse, 'submitted');

      await logout(page);
      await loginAsTrainer(page);
      await openReportListPage(page);

      await expectTrainerDailyReportContent(
        page,
        periodKey,
        E_R02_DAILY_VALUES,
      );
    });
  });

  /** E-R03: 提出する週次報告の全項目 */
  const E_R03_WEEKLY_VALUES = {
    achievements: 'E-R03 今週の成果',
    nextWeekGoals: 'E-R03 来週の目標',
    reflection: 'E-R03 所感',
    questionsForTrainer: 'E-R03 トレーナーへの相談',
  } as const satisfies WeeklyReportFieldValues;

  /**
   * E-R03: 新卒の週次報告作成からトレーナー閲覧まで
   * 観点: CUJ / 連携 / 操作性
   *
   * 手順:
   * 1. 新卒で `/reports/weekly` から全項目入力・提出
   * 2. ログアウトしトレーナーで `/reports` を開く
   * 3. 当週の週次報告を確認
   *
   * 期待結果（表示）:
   * - トレーナーの報告書一覧に当週の週次報告が表示される
   * - 各項目（今週の成果 / 来週の目標 / 所感 / トレーナーへの相談）の内容が一致する
   *
   * 期待結果（データ）:
   * - 提出時の PUT レスポンスで `status=submitted` となる
   *
   * 参照: docs/test-specs/report-feature.md E-R03
   */
  test.describe('E-R03 新卒の週次報告作成からトレーナー閲覧まで', () => {
    test('新卒が週次報告を提出_トレーナー一覧で全項目の内容が一致する', async ({
      page,
    }) => {
      const periodKey = formatWeeklyReportPeriodKey();

      await loginAsTrainee(page);
      await openWeeklyReportPage(page);
      await fillWeeklyReportFields(page, E_R03_WEEKLY_VALUES);

      const submitResponse = await submitWeeklyReport(page);
      await expectReportResponseStatus(submitResponse, 'submitted');

      await logout(page);
      await loginAsTrainer(page);
      await openReportListPage(page);

      await expectTrainerWeeklyReportContent(
        page,
        periodKey,
        E_R03_WEEKLY_VALUES,
      );
    });
  });

  /** E-R04: 初回提出時の日次報告 */
  const E_R04_INITIAL_DAILY_VALUES = {
    doneToday: 'E-R04 本日やったこと',
    learnedToday: 'E-R04 学んだこと（初回）',
    blockers: 'E-R04 困っていること',
    planTomorrow: 'E-R04 明日やること',
  } as const satisfies DailyReportFieldValues;

  /** E-R04: 「学んだこと」変更後の日次報告 */
  const E_R04_UPDATED_LEARNED_TODAY = 'E-R04 学んだこと（更新後）';

  const E_R04_UPDATED_DAILY_VALUES = {
    ...E_R04_INITIAL_DAILY_VALUES,
    learnedToday: E_R04_UPDATED_LEARNED_TODAY,
  } as const satisfies DailyReportFieldValues;

  /**
   * E-R04: 提出済み日次報告の編集
   * 観点: CUJ / 連携 / 操作性
   *
   * 手順:
   * 1. 新卒で `/reports/daily` から全項目入力・提出（前提の提出済み状態を作る）
   * 2. 同一日の報告を開き「学んだこと」を変更して再提出
   * 3. ログアウトしトレーナーで `/reports` を確認
   *
   * 期待結果（表示）:
   * - トレーナー一覧に変更後の「学んだこと」が表示される
   * - 変更前の「学んだこと」は表示されない
   * - 当該日の報告件数は 1 件のまま
   *
   * 期待結果（データ）:
   * - 再提出時の PUT レスポンスで `status=submitted` となる
   *
   * 参照: docs/test-specs/report-feature.md E-R04
   */
  test.describe('E-R04 提出済み日次報告の編集', () => {
    test('学んだことを変更して再提出_トレーナー一覧に反映され件数は1件のまま', async ({
      page,
    }) => {
      const periodKey = formatDailyReportPeriodKey();

      await loginAsTrainee(page);
      await openDailyReportPage(page);
      await fillDailyReportFields(page, E_R04_INITIAL_DAILY_VALUES);
      const initialSubmit = await submitDailyReport(page);
      await expectReportResponseStatus(initialSubmit, 'submitted');

      await openDailyReportPage(page);
      await expectDailyReportFieldValues(page, E_R04_INITIAL_DAILY_VALUES);
      await fillDailyReportFields(page, {
        learnedToday: E_R04_UPDATED_LEARNED_TODAY,
      });
      await expectDailyReportFieldValues(page, E_R04_UPDATED_DAILY_VALUES);

      const resubmitResponse = await submitDailyReport(page);
      await expectReportResponseStatus(resubmitResponse, 'submitted');

      await logout(page);
      await loginAsTrainer(page);
      await openReportListPage(page);

      await expectTrainerReportCount(page, periodKey, 1);
      await expectTrainerDailyReportContent(
        page,
        periodKey,
        E_R04_UPDATED_DAILY_VALUES,
      );
      await expect(
        trainerReportCard(page, periodKey).getByText(
          E_R04_INITIAL_DAILY_VALUES.learnedToday,
        ),
      ).toHaveCount(0);
    });
  });

  /** E-R05: 初回提出時の週次報告 */
  const E_R05_INITIAL_WEEKLY_VALUES = {
    achievements: 'E-R05 今週の成果',
    nextWeekGoals: 'E-R05 来週の目標',
    reflection: 'E-R05 所感（初回）',
    questionsForTrainer: 'E-R05 トレーナーへの相談',
  } as const satisfies WeeklyReportFieldValues;

  /** E-R05: 「所感」変更後の週次報告 */
  const E_R05_UPDATED_REFLECTION = 'E-R05 所感（更新後）';

  const E_R05_UPDATED_WEEKLY_VALUES = {
    ...E_R05_INITIAL_WEEKLY_VALUES,
    reflection: E_R05_UPDATED_REFLECTION,
  } as const satisfies WeeklyReportFieldValues;

  /**
   * E-R05: 提出済み週次報告の編集
   * 観点: CUJ / 連携 / 操作性
   *
   * 手順:
   * 1. 新卒で `/reports/weekly` から全項目入力・提出（前提の提出済み状態を作る）
   * 2. 同一週の報告を開き「所感」を変更して再提出
   * 3. ログアウトしトレーナーで `/reports` を確認
   *
   * 期待結果（表示）:
   * - トレーナー一覧に変更後の「所感」が表示される
   * - 変更前の「所感」は表示されない
   * - 当該週の報告件数は 1 件のまま
   *
   * 期待結果（データ）:
   * - 再提出時の PUT レスポンスで `status=submitted` となる
   *
   * 参照: docs/test-specs/report-feature.md E-R05
   */
  test.describe('E-R05 提出済み週次報告の編集', () => {
    test('所感を変更して再提出_トレーナー一覧に反映され件数は1件のまま', async ({
      page,
    }) => {
      const periodKey = formatWeeklyReportPeriodKey();

      await loginAsTrainee(page);
      await openWeeklyReportPage(page);
      await fillWeeklyReportFields(page, E_R05_INITIAL_WEEKLY_VALUES);
      const initialSubmit = await submitWeeklyReport(page);
      await expectReportResponseStatus(initialSubmit, 'submitted');

      await openWeeklyReportPage(page);
      await expectWeeklyReportFieldValues(page, E_R05_INITIAL_WEEKLY_VALUES);
      await fillWeeklyReportFields(page, {
        reflection: E_R05_UPDATED_REFLECTION,
      });
      await expectWeeklyReportFieldValues(page, E_R05_UPDATED_WEEKLY_VALUES);

      const resubmitResponse = await submitWeeklyReport(page);
      await expectReportResponseStatus(resubmitResponse, 'submitted');

      await logout(page);
      await loginAsTrainer(page);
      await openReportListPage(page);

      await expectTrainerReportCount(page, periodKey, 1);
      await expectTrainerWeeklyReportContent(
        page,
        periodKey,
        E_R05_UPDATED_WEEKLY_VALUES,
      );
      await expect(
        trainerReportCard(page, periodKey).getByText(
          E_R05_INITIAL_WEEKLY_VALUES.reflection,
        ),
      ).toHaveCount(0);
    });
  });

  /**
   * E-R06: 新卒の画面遷移（ヘッダー → `/reports`）
   * 観点: CUJ / 操作性
   *
   * 手順:
   * 1. 新卒で `/home` を開く
   * 2. ヘッダー「報告書」から `/reports` へ遷移する
   * 3. 日次初期表示・週次トグル・右ペイン一覧を確認する
   *
   * 期待結果（表示）:
   * - URL が `/reports` であり、初期は日次入力＋日次一覧
   * - 週次トグル後は週次入力＋週次一覧になる
   *
   * 参照: docs/test-specs/report-feature.md E-R06
   */
  test.describe('E-R06 新卒の画面遷移（ヘッダー → /reports）', () => {
    test('ヘッダー報告書からreportsへ遷移_日次週次トグルと右ペイン一覧が利用できる', async ({
      page,
    }) => {
      await loginAsTrainee(page);
      await openTraineeHomePage(page);

      await navigateFromTraineeHomeToReports(page);
      await expectTraineeReportsPageWithFormsAndLinks(page);

      await navigateBackToTraineeHome(page);
      await navigateFromTraineeHomeToReports(page);
      await expectTraineeReportsPageWithFormsAndLinks(page);
    });
  });

  /**
   * E-R07: トレーナーの画面遷移（ヘッダー → `/reports`）
   * 観点: CUJ / 操作性
   *
   * 手順:
   * 1. トレーナーで `/dashboard` を開く
   * 2. ダッシュボードに「報告書一覧」リンクがないことを確認する
   * 3. ヘッダー「報告書」から `/reports` へ遷移する
   *
   * 期待結果（表示）:
   * - 担当新卒の報告書一覧画面の見出しが表示される
   *
   * 参照: docs/test-specs/report-feature.md E-R07
   */
  test.describe('E-R07 トレーナーの画面遷移（ヘッダー → /reports）', () => {
    test('ダッシュボードに報告書一覧リンクがなくヘッダー報告書から一覧へ遷移できる', async ({
      page,
    }) => {
      await loginAsTrainer(page);
      await openTrainerDashboardPage(page);
      await expectDashboardHasNoReportListLink(page);
      await navigateFromTrainerDashboardToReportList(page);
    });
  });

  /**
   * E-R08: 過去報告一覧の表示
   * 観点: CUJ / 連携 / 操作性
   *
   * 手順:
   * 1. API で過去 3 日分の日次報告を投入する（前提データ）
   * 2. 新卒で `/reports/daily/list` を開く
   * 3. 過去報告欄を確認する
   *
   * 期待結果（表示）:
   * - URL が `/reports/daily/list` となり、過去報告が日付順（新しい順）で表示される
   *
   * 参照: docs/test-specs/report-feature.md E-R08
   */
  test.describe('E-R08 過去報告一覧の表示', () => {
    test('daily/listを開くと過去3日分が新しい順で表示される', async ({
      page,
      request,
    }) => {
      const reportsOldestFirst = buildPastDailyReportsOldestFirst(
        [3, 2, 1],
        'E-R08',
      );
      const reportsNewestFirst = [...reportsOldestFirst].reverse();

      await seedPastDailyReportsViaApi(request, reportsOldestFirst);

      await loginAsTrainee(page);
      await navigateFromReportsPageToDailyReportList(page);
      await expectPastDailyReportsNewestFirst(page, reportsNewestFirst);
    });
  });

  /** E-R09: 「本日やったこと」以外は入力済み・doneToday は空 */
  const E_R09_INVALID_DAILY_VALUES = {
    doneToday: '',
    learnedToday: 'E-R09 学んだこと',
    blockers: 'E-R09 困っていること',
    planTomorrow: 'E-R09 明日やること',
  } as const satisfies DailyReportFieldValues;

  /**
   * E-R09: 必須項目未入力での提出
   * 観点: 異常系 / 操作性
   *
   * 手順:
   * 1. 新卒で `/reports/daily` を開く
   * 2. 「本日やったこと」を空のまま、他項目を入力して提出する
   *
   * 期待結果（表示）:
   * - バリデーションエラー（「本日やったことを入力してください」）が表示される
   * - 提出成功メッセージは表示されない
   *
   * 期待結果（データ）:
   * - PUT `/api/reports/daily/:date` が HTTP 400 となり提出されない
   *
   * 参照: docs/test-specs/report-feature.md E-R09
   */
  test.describe('E-R09 必須項目未入力での提出', () => {
    test('本日やったことが空のまま提出_バリデーションエラーが表示され提出されない', async ({
      page,
    }) => {
      await loginAsTrainee(page);
      await openDailyReportPage(page);
      await fillDailyReportFields(page, E_R09_INVALID_DAILY_VALUES);
      await expectDailyReportFieldValues(page, E_R09_INVALID_DAILY_VALUES);

      await submitDailyReportExpectingValidationError(page);
    });
  });

  const E_R10_DAILY_REPORT = {
    periodKey: formatDailyReportPeriodKeyDaysAgo(1),
    content: {
      doneToday: 'E-R10 日次 本日やったこと',
      learnedToday: 'E-R10 日次 学んだこと',
      blockers: 'E-R10 日次 困っていること',
      planTomorrow: 'E-R10 日次 明日やること',
    },
  } as const satisfies SeededPastDailyReport;

  const E_R10_WEEKLY_REPORT = {
    periodKey: formatWeeklyReportPeriodKeyWeeksAgo(1),
    content: {
      achievements: 'E-R10 週次 今週の成果',
      nextWeekGoals: 'E-R10 週次 来週の目標',
      reflection: 'E-R10 週次 所感',
      questionsForTrainer: 'E-R10 週次 トレーナーへの相談',
    },
  } as const satisfies SeededPastWeeklyReport;

  /**
   * E-R10: トレーナー報告一覧のフィルタ
   * 観点: CUJ / 連携 / 操作性
   *
   * 手順:
   * 1. API で担当新卒に日次・週次報告を混在投入する（前提データ）
   * 2. トレーナーで `/reports` を開く
   * 3. 報告種別フィルタで `type=daily`（日次）を選択する
   *
   * 期待結果（表示）:
   * - 日次報告のみが一覧に表示される
   * - 週次報告は表示されない
   *
   * 期待結果（データ）:
   * - GET `/api/reports?traineeId=...&type=daily` が呼ばれる
   *
   * 参照: docs/test-specs/report-feature.md E-R10
   */
  test.describe('E-R10 トレーナー報告一覧のフィルタ', () => {
    test('type=dailyでフィルタ_日次報告のみが表示され週次は表示されない', async ({
      page,
      request,
    }) => {
      await putTraineeDailyReportViaApi(request, E_R10_DAILY_REPORT);
      await putTraineeWeeklyReportViaApi(request, E_R10_WEEKLY_REPORT);

      await loginAsTrainer(page);
      await openReportListPage(page);

      await expectTrainerReportCount(page, E_R10_DAILY_REPORT.periodKey, 1);
      await expectTrainerReportCount(page, E_R10_WEEKLY_REPORT.periodKey, 1);

      const filterResponse = await filterTrainerReportsByType(
        page,
        REPORT_TYPE_FILTER_VALUE_DAILY,
      );
      expect(filterResponse.ok()).toBeTruthy();

      await expectTrainerDailyReportContent(
        page,
        E_R10_DAILY_REPORT.periodKey,
        E_R10_DAILY_REPORT.content,
      );
      await expectTrainerReportCount(page, E_R10_WEEKLY_REPORT.periodKey, 0);
    });
  });

  /**
   * E-R11: CI パイプライン通過
   * 観点: 連携（品質ゲート）
   *
   * 手順:
   * 1. CI ワークフロー（`.github/workflows/ci.yml`）が vitest / playwright を実行する定義か確認する
   * 2. 報告書の自動化対象 Vitest（API・Web）を実行する
   * 3. 報告書 E2E（E-R01〜E-R10）が `tests/report.spec.test.ts` に揃っていることを確認する
   *
   * 期待結果:
   * - CI が Vitest と Playwright を実行する（報告書 Web Vitest を含む）
   * - 報告書の Vitest 自動化対象がすべて Pass する
   * - E-R01〜E-R10 が定義され、同一 CI の Playwright ジョブで実行対象になる
   *
   * 参照: docs/test-specs/report-feature.md E-R11
   */
  test.describe('E-R11 CI パイプライン通過', () => {
    test('CIがvitestとplaywrightを実行し報告書の自動化対象がPassする', async () => {
      test.setTimeout(REPORT_CI_GATE_TIMEOUT_MS);

      await expectCiWorkflowRunsVitestAndPlaywright();
      await expectReportFeatureVitestSuitesPass();
      await expectReportE2eAutomationTargetsPresent();
    });
  });

  /**
   * E-R12: 廃止ルートのリダイレクト
   * 観点: CUJ / 操作性
   *
   * 手順:
   * 1. 新卒で `/reports/daily` および `/reports/weekly` に直接アクセスする
   *
   * 期待結果（表示）:
   * - いずれも `/reports` へリダイレクトされる
   *
   * 参照: docs/test-specs/report-feature.md E-R12
   */
  test.describe('E-R12 廃止ルートのリダイレクト', () => {
    test('旧日次週次パス直接アクセス_reportsへリダイレクトされる', async ({
      page,
    }) => {
      await loginAsTrainee(page);
      await expectLegacyReportPathRedirectsToReports(
        page,
        DAILY_REPORT_LEGACY_PATH,
      );
      await expectLegacyReportPathRedirectsToReports(
        page,
        WEEKLY_REPORT_LEGACY_PATH,
      );
    });
  });

  const E_R13_UNIQUE_SEARCH = 'E-R13ユニーク検索語';

  const E_R13_MATCH_DAILY_REPORT = {
    periodKey: formatDailyReportPeriodKeyDaysAgo(2),
    content: {
      doneToday: `${E_R13_UNIQUE_SEARCH} 本日やったこと`,
      learnedToday: 'E-R13 学んだこと（一致）',
      blockers: 'E-R13 困っていること',
      planTomorrow: 'E-R13 明日やること',
    },
  } as const satisfies SeededPastDailyReport;

  const E_R13_OTHER_DAILY_REPORT = {
    periodKey: formatDailyReportPeriodKeyDaysAgo(10),
    content: {
      doneToday: 'E-R13 別日の本日やったこと',
      learnedToday: 'E-R13 学んだこと（別日）',
      blockers: 'E-R13 困っていること',
      planTomorrow: 'E-R13 明日やること',
    },
  } as const satisfies SeededPastDailyReport;

  /**
   * E-R13: 日次一覧の本文検索・期間絞り込み
   * 観点: CUJ / 連携 / 操作性
   *
   * 参照: docs/test-specs/report-feature.md E-R13
   */
  test.describe('E-R13 日次一覧の本文検索・期間絞り込み', () => {
    test('本文検索とfrom/toと特定日で条件に一致する報告のみ表示される', async ({
      page,
      request,
    }) => {
      await putTraineeDailyReportViaApi(request, E_R13_MATCH_DAILY_REPORT);
      await putTraineeDailyReportViaApi(request, E_R13_OTHER_DAILY_REPORT);

      await loginAsTrainee(page);
      await openDailyReportListPage(page);
      await expectPastDailyReportPeriodKeysVisible(page, [
        E_R13_MATCH_DAILY_REPORT.periodKey,
        E_R13_OTHER_DAILY_REPORT.periodKey,
      ]);

      await fillReportListFilter(page, { q: E_R13_UNIQUE_SEARCH });
      const searchResponse = await applyDailyReportListFilter(page);
      expect(searchResponse.ok()).toBeTruthy();
      await expectPastDailyReportPeriodKeysVisible(page, [
        E_R13_MATCH_DAILY_REPORT.periodKey,
      ]);
      await expectPastDailyReportPeriodKeysNotVisible(page, [
        E_R13_OTHER_DAILY_REPORT.periodKey,
      ]);

      await openDailyReportListPage(page);
      await fillReportListFilter(page, {
        from: formatDailyReportPeriodKeyDaysAgo(3),
        to: formatDailyReportPeriodKeyDaysAgo(1),
      });
      const rangeResponse = await applyDailyReportListFilter(page);
      expect(rangeResponse.ok()).toBeTruthy();
      await expectPastDailyReportPeriodKeysVisible(page, [
        E_R13_MATCH_DAILY_REPORT.periodKey,
      ]);
      await expectPastDailyReportPeriodKeysNotVisible(page, [
        E_R13_OTHER_DAILY_REPORT.periodKey,
      ]);

      await openDailyReportListPage(page);
      await fillReportListFilter(page, {
        date: E_R13_MATCH_DAILY_REPORT.periodKey,
      });
      const dateResponse = await applyDailyReportListFilter(page);
      expect(dateResponse.ok()).toBeTruthy();
      await expectPastDailyReportPeriodKeysVisible(page, [
        E_R13_MATCH_DAILY_REPORT.periodKey,
      ]);
      await expectPastDailyReportPeriodKeysNotVisible(page, [
        E_R13_OTHER_DAILY_REPORT.periodKey,
      ]);
    });
  });

  const E_R14_UNIQUE_SEARCH = 'E-R14ユニーク検索語';

  const E_R14_MATCH_WEEKLY_REPORT = {
    periodKey: formatWeeklyReportPeriodKeyWeeksAgo(1),
    content: {
      achievements: `${E_R14_UNIQUE_SEARCH} 今週の成果`,
      nextWeekGoals: 'E-R14 来週の目標',
      reflection: 'E-R14 所感',
      questionsForTrainer: 'E-R14 トレーナーへの相談',
    },
  } as const satisfies SeededPastWeeklyReport;

  const E_R14_OTHER_WEEKLY_REPORT = {
    periodKey: formatWeeklyReportPeriodKeyWeeksAgo(4),
    content: {
      achievements: 'E-R14 別週の成果',
      nextWeekGoals: 'E-R14 来週の目標（別週）',
      reflection: 'E-R14 所感（別週）',
      questionsForTrainer: 'E-R14 相談（別週）',
    },
  } as const satisfies SeededPastWeeklyReport;

  /**
   * E-R14: 週次一覧の本文検索・期間絞り込み
   * 観点: CUJ / 連携 / 操作性
   *
   * 参照: docs/test-specs/report-feature.md E-R14
   */
  test.describe('E-R14 週次一覧の本文検索・期間絞り込み', () => {
    test('本文検索と日付週キーfrom/toで条件に一致する報告のみ表示される', async ({
      page,
      request,
    }) => {
      await putTraineeWeeklyReportViaApi(request, E_R14_MATCH_WEEKLY_REPORT);
      await putTraineeWeeklyReportViaApi(request, E_R14_OTHER_WEEKLY_REPORT);

      await loginAsTrainee(page);
      await openWeeklyReportListPage(page);
      await expectPastWeeklyReportPeriodKeysVisible(page, [
        E_R14_MATCH_WEEKLY_REPORT.periodKey,
        E_R14_OTHER_WEEKLY_REPORT.periodKey,
      ]);

      await fillReportListFilter(page, { q: E_R14_UNIQUE_SEARCH });
      const searchResponse = await applyWeeklyReportListFilter(page);
      expect(searchResponse.ok()).toBeTruthy();
      await expectPastWeeklyReportPeriodKeysVisible(page, [
        E_R14_MATCH_WEEKLY_REPORT.periodKey,
      ]);
      await expectPastWeeklyReportPeriodKeysNotVisible(page, [
        E_R14_OTHER_WEEKLY_REPORT.periodKey,
      ]);

      await openWeeklyReportListPage(page);
      await fillReportListFilter(
        page,
        { date: E_R14_MATCH_WEEKLY_REPORT.periodKey },
        { dateFieldLabel: REPORT_LIST_WEEKLY_DATE_LABEL },
      );
      const weekKeyResponse = await applyWeeklyReportListFilter(page);
      expect(weekKeyResponse.ok()).toBeTruthy();
      await expectPastWeeklyReportPeriodKeysVisible(page, [
        E_R14_MATCH_WEEKLY_REPORT.periodKey,
      ]);
      await expectPastWeeklyReportPeriodKeysNotVisible(page, [
        E_R14_OTHER_WEEKLY_REPORT.periodKey,
      ]);

      await openWeeklyReportListPage(page);
      await fillReportListFilter(
        page,
        { date: formatDailyReportPeriodKeyDaysAgo(7) },
        { dateFieldLabel: REPORT_LIST_WEEKLY_DATE_LABEL },
      );
      const dateResponse = await applyWeeklyReportListFilter(page);
      expect(dateResponse.ok()).toBeTruthy();
      await expectPastWeeklyReportPeriodKeysVisible(page, [
        E_R14_MATCH_WEEKLY_REPORT.periodKey,
      ]);
      await expectPastWeeklyReportPeriodKeysNotVisible(page, [
        E_R14_OTHER_WEEKLY_REPORT.periodKey,
      ]);

      await openWeeklyReportListPage(page);
      await fillReportListFilter(page, {
        from: formatWeeklyReportPeriodKeyWeeksAgo(2),
        to: formatWeeklyReportPeriodKeyWeeksAgo(0),
      });
      const rangeResponse = await applyWeeklyReportListFilter(page);
      expect(rangeResponse.ok()).toBeTruthy();
      await expectPastWeeklyReportPeriodKeysVisible(page, [
        E_R14_MATCH_WEEKLY_REPORT.periodKey,
      ]);
      await expectPastWeeklyReportPeriodKeysNotVisible(page, [
        E_R14_OTHER_WEEKLY_REPORT.periodKey,
      ]);
    });
  });

  /**
   * E-R15: 期間条件同時指定のエラー表示
   * 観点: 異常系 / 操作性
   *
   * 参照: docs/test-specs/report-feature.md E-R15
   */
  test.describe('E-R15 期間条件同時指定のエラー表示', () => {
    test('from/toとdate同時指定_エラー表示され一覧は更新されない', async ({
      page,
      request,
    }) => {
      await putTraineeDailyReportViaApi(request, E_R13_MATCH_DAILY_REPORT);
      await putTraineeDailyReportViaApi(request, E_R13_OTHER_DAILY_REPORT);

      await loginAsTrainee(page);
      await openDailyReportListPage(page);
      await expectPastDailyReportPeriodKeysVisible(page, [
        E_R13_MATCH_DAILY_REPORT.periodKey,
        E_R13_OTHER_DAILY_REPORT.periodKey,
      ]);

      await fillReportListFilter(page, {
        from: formatDailyReportPeriodKeyDaysAgo(30),
        to: formatDailyReportPeriodKeyDaysAgo(0),
        date: E_R13_MATCH_DAILY_REPORT.periodKey,
      });
      await submitReportListFilter(page);

      await expectReportListFilterConflictError(page);
      await expectPastDailyReportPeriodKeysVisible(page, [
        E_R13_MATCH_DAILY_REPORT.periodKey,
        E_R13_OTHER_DAILY_REPORT.periodKey,
      ]);
      await expectPastDailyReportPeriodKeysNotVisible(page, []);
    });
  });

  const P_R01_DAILY_REPORT = {
    periodKey: formatDailyReportPeriodKeyDaysAgo(2),
    content: {
      doneToday: 'P-R01 本日やったこと',
      learnedToday: 'P-R01 学んだこと',
      blockers: 'P-R01 困っていること',
      planTomorrow: 'P-R01 明日やること',
    },
  } as const satisfies SeededPastDailyReport;

  const P_R01_COMMENT = 'P-R01 トレーナーからのフィードバックです';

  /**
   * P-R01: トレーナーコメントの投稿
   * 観点: CUJ / 連携 / 操作性
   *
   * 手順:
   * 1. API で新卒の提出済み日次報告を投入する（前提データ）
   * 2. トレーナーで `/reports` から当該報告の詳細を開く
   * 3. コメントを入力して送信する
   * 4. ログアウトし新卒で同一報告詳細を開く
   *
   * 期待結果（表示）:
   * - 送信後、トレーナー詳細にコメントが表示される
   * - 新卒の報告詳細でも同一コメントが確認できる
   *
   * 期待結果（データ）:
   * - POST `/api/reports/:id/comments` が成功する
   *
   * 参照: docs/test-specs/report-feature.md P-R01（UC-R05 / Phase 2）
   */
  test.describe('P-R01 トレーナーコメントの投稿', () => {
    test('トレーナーがコメント投稿_新卒が報告詳細で確認できる', async ({
      page,
      request,
    }) => {
      await putTraineeDailyReportViaApi(request, P_R01_DAILY_REPORT);

      await loginAsTrainer(page);
      await openReportListPage(page);
      await openTrainerReportDetail(page, P_R01_DAILY_REPORT.periodKey);

      const commentResponse = await submitTrainerReportComment(
        page,
        P_R01_COMMENT,
      );
      expect(commentResponse.ok()).toBeTruthy();
      await expectReportCommentVisible(page, P_R01_COMMENT);

      const detailPath = new URL(page.url()).pathname;

      await logout(page);
      await loginAsTrainee(page);
      await openReportDetailPage(page, detailPath);
      await expectReportCommentVisible(page, P_R01_COMMENT);
    });
  });

  const P_R02_DAILY_REPORT = {
    periodKey: formatDailyReportPeriodKeyDaysAgo(3),
    content: {
      doneToday: 'P-R02 本日やったこと',
      learnedToday: 'P-R02 学んだこと',
      blockers: 'P-R02 困っていること',
      planTomorrow: 'P-R02 明日やること',
    },
  } as const satisfies SeededPastDailyReport;

  const P_R02_INITIAL_COMMENT = 'P-R02 初回コメント';
  const P_R02_UPDATED_COMMENT = 'P-R02 更新後のコメント';

  /**
   * P-R02: トレーナーコメントの編集
   * 観点: CUJ / 連携 / 操作性
   *
   * 手順:
   * 1. API で提出済み日次報告を投入し、トレーナーが初回コメントを投稿する（前提）
   * 2. 同一コメントを編集して更新する
   * 3. ログアウトし新卒で同一報告詳細を開く
   *
   * 期待結果（表示）:
   * - 更新後のコメントが表示される
   * - 更新前のコメントは表示されない
   * - 新卒の報告詳細でも更新後の内容が確認できる
   *
   * 期待結果（データ）:
   * - PUT `/api/reports/:id/comments/:commentId` が成功する
   *
   * 参照: docs/test-specs/report-feature.md P-R02（UC-R05 / Phase 2）
   */
  test.describe('P-R02 トレーナーコメントの編集', () => {
    test('トレーナーがコメントを更新_新卒詳細に更新後の内容が反映される', async ({
      page,
      request,
    }) => {
      await putTraineeDailyReportViaApi(request, P_R02_DAILY_REPORT);

      await loginAsTrainer(page);
      await openReportListPage(page);
      await openTrainerReportDetail(page, P_R02_DAILY_REPORT.periodKey);

      const createResponse = await submitTrainerReportComment(
        page,
        P_R02_INITIAL_COMMENT,
      );
      expect(createResponse.ok()).toBeTruthy();
      await expectReportCommentVisible(page, P_R02_INITIAL_COMMENT);

      await startEditTrainerReportComment(page, P_R02_INITIAL_COMMENT);
      const updateResponse = await updateTrainerReportComment(
        page,
        P_R02_UPDATED_COMMENT,
      );
      expect(updateResponse.ok()).toBeTruthy();
      await expectReportCommentVisible(page, P_R02_UPDATED_COMMENT);
      await expectReportCommentNotVisible(page, P_R02_INITIAL_COMMENT);

      const detailPath = new URL(page.url()).pathname;

      await logout(page);
      await loginAsTrainee(page);
      await openReportDetailPage(page, detailPath);
      await expectReportCommentVisible(page, P_R02_UPDATED_COMMENT);
      await expectReportCommentNotVisible(page, P_R02_INITIAL_COMMENT);
    });
  });
});
