import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { Firestore } from '@google-cloud/firestore';
import { isFirestoreEmulatorReachable } from './firestoreEmulatorEnv.js';
import type { ReportRepository } from '../repositories/reportRepository.js';
import {
  TRAINEE_USER_ID,
  U_R01_DAILY_CONTENT,
  U_R01_DAILY_DATE,
  U_R01_PUT_BODY,
  U_R02_DAILY_DATE,
  U_R02_PUT_BODY,
  U_R03_DAILY_DATE,
  U_R03_DRAFT_PUT_BODY,
  U_R03_SUBMITTED_CONTENT,
  U_R03_SUBMITTED_PUT_BODY,
  U_R04_DAILY_DATE,
  U_R04_INITIAL_PUT_BODY,
  U_R04_UPDATED_CONTENT,
  U_R04_UPDATED_PUT_BODY,
  U_R05_DAILY_DATE,
  U_R05_FIRST_PUT_BODY,
  U_R05_SECOND_CONTENT,
  U_R05_SECOND_PUT_BODY,
  U_R06_PUT_BODY,
  U_R06_WEEK_KEY,
  U_R06_WEEKLY_CONTENT,
  U_R07_INITIAL_PUT_BODY,
  U_R07_UPDATED_WEEKLY_CONTENT,
  U_R07_UPDATED_PUT_BODY,
  U_R07_WEEK_KEY,
  U_R08_FIRST_PUT_BODY,
  U_R08_SECOND_WEEKLY_CONTENT,
  U_R08_SECOND_PUT_BODY,
  U_R08_WEEK_KEY,
  U_R09_DAILY_DATE,
  U_R09_PUT_BODY,
  U_R10_PUT_BODY,
  U_R10_WEEK_KEY,
  U_R11_INVALID_DAILY_DATE,
  U_R11_PUT_BODY,
  U_R12_INVALID_WEEK_KEY,
  U_R12_PUT_BODY,
  U_R13_DAILY_CONTENT,
  U_R13_DAILY_DATE,
  U_R13_PUT_BODY,
  U_R14_DAILY_DATE,
  U_R15_LIST_TRAINEE_ID,
  U_R16_DAILY_DATE_NEWER,
  U_R16_DAILY_DATE_OLDER,
  U_R16_DAILY_PUT_BODY,
  U_R16_LIST_TRAINEE_ID,
  U_R16_WEEK_KEY_NEWER,
  U_R16_WEEK_KEY_OLDER,
  U_R16_WEEKLY_PUT_BODY,
  U_R17_DAILY_CONTENT,
  U_R17_DAILY_DATE,
  U_R17_PUT_BODY,
  U_R18_DAILY_CONTENT,
  U_R18_DAILY_DATE,
  U_R18_PUT_BODY,
  OTHER_TRAINEE_HEADERS,
  OTHER_TRAINEE_USER_ID,
  U_R19_OTHER_TRAINEE_DAILY_CONTENT,
  U_R19_OTHER_TRAINEE_DAILY_DATE,
  U_R19_OTHER_TRAINEE_PUT_BODY,
  U_R20_DAILY_DATE,
  U_R20_PUT_BODY,
  U_R21_DAILY_DATE,
  UNAUTHENTICATED_HEADERS,
  U_R22_DAILY_DATE,
  U_R22_INVALID_STATUS_PUT_BODY,
  REPORT_CONTENT_FIELD_MAX_LENGTH,
  U_R23_DAILY_CONTENT,
  U_R23_DAILY_DATE,
  U_R23_PUT_BODY,
  U_R24_DAILY_CONTENT,
  U_R24_DAILY_DATE,
  U_R24_PUT_BODY,
  U_R25_DAILY_DATE,
  U_R25_EMPTY_DAILY_CONTENT,
  U_R25_PUT_BODY,
  I_R01_DAILY_CONTENT,
  I_R01_DAILY_DATE,
  I_R01_PUT_BODY,
  I_R02_DAILY_DATE,
  I_R02_PUT_BODY,
  I_R03_DAILY_DATE_A,
  I_R03_DAILY_DATE_B,
  I_R03_DAILY_PUT_BODY,
  I_R03_LIST_TRAINEE_ID,
  I_R03_WEEK_KEY,
  I_R03_WEEKLY_PUT_BODY,
  I_R04_DAILY_DATE,
  I_R04_DAILY_PUT_BODY,
  I_R04_LIST_TRAINEE_ID,
  I_R04_WEEK_KEY_A,
  I_R04_WEEK_KEY_B,
  I_R04_WEEKLY_PUT_BODY,
  I_R05_DAILY_DATE,
  I_R05_LIST_TRAINEE_ID,
  I_R05_PUT_BODY,
  I_R06_MATCH_DATE,
  I_R06_MATCH_PUT_BODY,
  I_R06_OTHER_DATE,
  I_R06_OTHER_PUT_BODY,
  I_R06_SEARCH_TERM,
  I_R07_FROM,
  I_R07_IN_RANGE_DATE,
  I_R07_OUT_RANGE_DATE,
  I_R07_TO,
  I_R08_OTHER_DATE,
  I_R08_TARGET_DATE,
  I_R09_MATCH_PUT_BODY,
  I_R09_OTHER_PUT_BODY,
  I_R09_SEARCH_TERM,
  I_R09_WEEK_MATCH,
  I_R09_WEEK_OTHER,
  I_R10_DATE_IN_WEEK,
  I_R10_WEEK_KEY,
  I_R12_DATE,
  I_R12_FROM,
  I_R12_TO,
  TRAINER_HEADERS,
  TRAINER_USER_ID,
  TRAINEE_HEADERS,
  getDailyReport,
  getOwnDailyReports,
  getOwnWeeklyReports,
  getReportById,
  getReports,
  putDailyReport,
  putWeeklyReport,
} from './reportTestFixtures.js';
import { REPORT_PERIOD_FILTER_CONFLICT_MESSAGE } from '../reports/reportOwnListQuery.js';
import {
  clearReportsCollection,
  createReportFirestoreTestContext,
  expectNoDailyReportSaved,
  expectApiResponseMatchesStoredReport,
  expectForbiddenOrEmptyReportList,
  expectReportPersistedInCollection,
  expectTrainerReportsFilteredByType,
  findDailyReportsInFirestore,
  findWeeklyReportsInFirestore,
  readSingleReportDocument,
  resetReportFirestoreTestContext,
  seedMixedDailyAndWeeklyReports,
} from './reportFirestoreTestHelpers.js';
import { buildReportUniquenessKey } from '../reports/reportUniquenessKey.js';
import {
  REPORT_STATUS_SUBMITTED,
  REPORT_TYPE_DAILY,
  REPORT_TYPE_WEEKLY,
} from '../reports/reportConstants.js';

const firestoreEmulatorAvailable = await isFirestoreEmulatorReachable();

function setupReportFirestoreTests() {
  let db: Firestore;
  let repository: ReportRepository;

  beforeEach(async ({ skip }) => {
    if (!firestoreEmulatorAvailable) {
      skip();
    }
    ({ db, repository } = createReportFirestoreTestContext());
    await clearReportsCollection(db);
  });

  afterEach(() => {
    resetReportFirestoreTestContext();
  });

  return {
    getDb: () => db,
    getRepository: () => repository,
  };
}

/**
 * U-R01: 日次報告の新規提出
 *
 * 前提条件: 新卒（`trainee-1`）として認証済み。当該日の日次報告は未作成
 * 入力値: `PUT /api/reports/daily/2026-07-28` に `status: submitted` と全項目を送信
 * 期待結果: HTTP 200。Firestore `reports` に `type=daily`, `periodKey=2026-07-28`,
 *           `status=submitted` のドキュメントが 1 件保存される。`submittedAt` が設定される
 *
 * 結合境界: reportRoutes → reportFacade → ReportRepository → Firestore
 * 参照: docs/test-specs/report-feature.md U-R01
 */
describe('U-R01 日次報告の新規提出', () => {
  const testContext = setupReportFirestoreTests();

  it('putDailyReport_新卒が日次報告を提出_HTTP200かつFirestoreにsubmittedとして1件保存される', async () => {
    const response = await putDailyReport(
      U_R01_DAILY_DATE,
      U_R01_PUT_BODY,
      testContext.getRepository(),
    );

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        traineeId: TRAINEE_USER_ID,
        type: REPORT_TYPE_DAILY,
        periodKey: U_R01_DAILY_DATE,
        status: REPORT_STATUS_SUBMITTED,
        content: U_R01_DAILY_CONTENT,
        submittedAt: expect.any(String),
      }),
    );

    const submittedAt = (response.body as { submittedAt?: string }).submittedAt;
    expect(submittedAt).toBeTruthy();
    expect(() => new Date(submittedAt!).toISOString()).not.toThrow();

    const snapshot = await findDailyReportsInFirestore(
      testContext.getDb(),
      TRAINEE_USER_ID,
      U_R01_DAILY_DATE,
    );

    expectReportPersistedInCollection(snapshot, {
      traineeId: TRAINEE_USER_ID,
      type: REPORT_TYPE_DAILY,
      periodKey: U_R01_DAILY_DATE,
      content: U_R01_DAILY_CONTENT,
      status: REPORT_STATUS_SUBMITTED,
      submittedAt,
    });
  });
});

/**
 * U-R02: 日次報告の下書き保存は拒否される（下書き廃止 / BR-R03）
 *
 * 前提条件: 新卒として認証済み。当該日の日次報告は未作成
 * 入力値: `PUT /api/reports/daily/2026-07-29` に `status: draft` と一部項目のみ送信
 * 期待結果: HTTP 400。下書き保存は廃止されたため拒否され、保存されない
 *
 * 結合境界: reportRoutes → parsePutDailyReportBody → isReportStatus
 * 参照: docs/test-specs/report-feature.md U-R02
 */
describe('U-R02 日次報告の下書き保存は拒否される', () => {
  const testContext = setupReportFirestoreTests();

  it('putDailyReport_statusがdraft_HTTP400で拒否され保存されない', async () => {
    const response = await putDailyReport(
      U_R02_DAILY_DATE,
      U_R02_PUT_BODY,
      testContext.getRepository(),
    );

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      error: 'Invalid report input',
    });

    const snapshot = await findDailyReportsInFirestore(
      testContext.getDb(),
      TRAINEE_USER_ID,
      U_R02_DAILY_DATE,
    );

    expect(snapshot.size).toBe(0);
  });
});

/**
 * U-R03: 提出済み報告への下書き変更は拒否される（下書き廃止 / BR-R03）
 *
 * 前提条件: 新卒として認証済み。`2026-07-30` の日次報告が `submitted` で保存済み
 * 入力値: 同一日付に `status: draft` を `PUT`
 * 期待結果: HTTP 400。拒否され、既存の提出済みドキュメントは変更されない
 *
 * 結合境界: reportRoutes → parsePutDailyReportBody → isReportStatus
 * 参照: docs/test-specs/report-feature.md U-R03
 */
describe('U-R03 提出済み報告への下書き変更は拒否される', () => {
  const testContext = setupReportFirestoreTests();

  it('putDailyReport_提出済み報告にstatusdraftをPUT_HTTP400で拒否され既存内容が変更されない', async () => {
    const submitResponse = await putDailyReport(
      U_R03_DAILY_DATE,
      U_R03_SUBMITTED_PUT_BODY,
      testContext.getRepository(),
    );

    expect(submitResponse.statusCode).toBe(200);

    const submittedReportId = (submitResponse.body as { id: string }).id;

    const draftResponse = await putDailyReport(
      U_R03_DAILY_DATE,
      U_R03_DRAFT_PUT_BODY,
      testContext.getRepository(),
    );

    expect(draftResponse.statusCode).toBe(400);
    expect(draftResponse.body).toEqual({
      error: 'Invalid report input',
    });

    const snapshot = await findDailyReportsInFirestore(
      testContext.getDb(),
      TRAINEE_USER_ID,
      U_R03_DAILY_DATE,
    );

    expectReportPersistedInCollection(snapshot, {
      id: submittedReportId,
      traineeId: TRAINEE_USER_ID,
      type: REPORT_TYPE_DAILY,
      periodKey: U_R03_DAILY_DATE,
      content: U_R03_SUBMITTED_CONTENT,
      status: REPORT_STATUS_SUBMITTED,
    });
  });
});

/**
 * U-R04: 提出済み日次報告の更新
 *
 * 前提条件: 新卒として認証済み。当該日の日次報告が `submitted` で保存済み
 * 入力値: 同一日付に `learnedToday` を変更して `PUT`
 * 期待結果: HTTP 200。既存ドキュメントが更新され、件数は 1 件のまま。
 *           変更後の内容が `GET` で取得できる
 *
 * 結合境界: reportRoutes → reportFacade → ReportRepository → Firestore
 *           reportRoutes → GET /reports/daily/:date
 * 参照: docs/test-specs/report-feature.md U-R04
 */
describe('U-R04 提出済み日次報告の更新', () => {
  const testContext = setupReportFirestoreTests();

  it('putDailyReport_提出済み報告のlearnedTodayを更新_HTTP200かつGETで変更内容が取得できる', async () => {
    const initialResponse = await putDailyReport(
      U_R04_DAILY_DATE,
      U_R04_INITIAL_PUT_BODY,
      testContext.getRepository(),
    );

    expect(initialResponse.statusCode).toBe(200);

    const initialReportId = (initialResponse.body as { id: string }).id;

    const updateResponse = await putDailyReport(
      U_R04_DAILY_DATE,
      U_R04_UPDATED_PUT_BODY,
      testContext.getRepository(),
    );

    expect(updateResponse.statusCode).toBe(200);
    expect(updateResponse.body).toEqual(
      expect.objectContaining({
        id: initialReportId,
        traineeId: TRAINEE_USER_ID,
        type: REPORT_TYPE_DAILY,
        periodKey: U_R04_DAILY_DATE,
        status: REPORT_STATUS_SUBMITTED,
        content: U_R04_UPDATED_CONTENT,
        submittedAt: expect.any(String),
      }),
    );

    const snapshot = await findDailyReportsInFirestore(
      testContext.getDb(),
      TRAINEE_USER_ID,
      U_R04_DAILY_DATE,
    );

    expectReportPersistedInCollection(snapshot, {
      id: initialReportId,
      traineeId: TRAINEE_USER_ID,
      type: REPORT_TYPE_DAILY,
      periodKey: U_R04_DAILY_DATE,
      content: U_R04_UPDATED_CONTENT,
      status: REPORT_STATUS_SUBMITTED,
    });
    expect(
      (snapshot.docs[0]!.data().content as { learnedToday: string })
        .learnedToday,
    ).toBe(U_R04_UPDATED_CONTENT.learnedToday);

    const getResponse = await getDailyReport(
      U_R04_DAILY_DATE,
      testContext.getRepository(),
    );

    expect(getResponse.statusCode).toBe(200);
    expect(getResponse.body).toEqual(
      expect.objectContaining({
        id: initialReportId,
        traineeId: TRAINEE_USER_ID,
        type: REPORT_TYPE_DAILY,
        periodKey: U_R04_DAILY_DATE,
        status: REPORT_STATUS_SUBMITTED,
        content: U_R04_UPDATED_CONTENT,
        submittedAt: expect.any(String),
      }),
    );
  });
});

/**
 * U-R05: 日次報告の 1 日 1 件制約
 *
 * 前提条件: 新卒として認証済み。当該日の日次報告が既存
 * 入力値: 同一 `date` に異なる内容で再度 `PUT`
 * 期待結果: 新規作成ではなく上書き更新となる。
 *           `traineeId + type + periodKey` の組み合わせで一意（§9 UNIQUE 制約）
 *
 * 結合境界: reportRoutes → reportFacade → ReportRepository → Firestore
 * 参照: docs/test-specs/report-feature.md U-R05
 */
describe('U-R05 日次報告の 1 日 1 件制約', () => {
  const testContext = setupReportFirestoreTests();

  it('putDailyReport_同一日付に異なる内容をPUT_上書き更新され件数は1件のまま', async () => {
    const firstResponse = await putDailyReport(
      U_R05_DAILY_DATE,
      U_R05_FIRST_PUT_BODY,
      testContext.getRepository(),
    );

    expect(firstResponse.statusCode).toBe(200);

    const firstReportId = (firstResponse.body as { id: string }).id;
    const firstCreatedAt = (firstResponse.body as { createdAt: string })
      .createdAt;

    const secondResponse = await putDailyReport(
      U_R05_DAILY_DATE,
      U_R05_SECOND_PUT_BODY,
      testContext.getRepository(),
    );

    expect(secondResponse.statusCode).toBe(200);
    expect(secondResponse.body).toEqual(
      expect.objectContaining({
        id: firstReportId,
        traineeId: TRAINEE_USER_ID,
        type: REPORT_TYPE_DAILY,
        periodKey: U_R05_DAILY_DATE,
        status: REPORT_STATUS_SUBMITTED,
        content: U_R05_SECOND_CONTENT,
      }),
    );
    expect((secondResponse.body as { createdAt: string }).createdAt).toBe(
      firstCreatedAt,
    );

    const snapshot = await findDailyReportsInFirestore(
      testContext.getDb(),
      TRAINEE_USER_ID,
      U_R05_DAILY_DATE,
    );

    expectReportPersistedInCollection(snapshot, {
      id: firstReportId,
      traineeId: TRAINEE_USER_ID,
      type: REPORT_TYPE_DAILY,
      periodKey: U_R05_DAILY_DATE,
      content: U_R05_SECOND_CONTENT,
      status: REPORT_STATUS_SUBMITTED,
    });

    const uniqueKeys = snapshot.docs.map((document) => {
      const data = document.data();
      return buildReportUniquenessKey({
        traineeId: data.traineeId as string,
        type: data.type as typeof REPORT_TYPE_DAILY,
        periodKey: data.periodKey as string,
      });
    });

    expect(new Set(uniqueKeys).size).toBe(1);
    expect(uniqueKeys[0]).toBe(
      buildReportUniquenessKey({
        traineeId: TRAINEE_USER_ID,
        type: REPORT_TYPE_DAILY,
        periodKey: U_R05_DAILY_DATE,
      }),
    );
  });
});

/**
 * U-R06: 週次報告の新規提出
 *
 * 前提条件: 新卒として認証済み。当該週の週次報告は未作成
 * 入力値: `PUT /api/reports/weekly/2026-W30` に `status: submitted` と全項目を送信
 * 期待結果: HTTP 200。Firestore に `type=weekly`, `periodKey=2026-W30`,
 *           `status=submitted` のドキュメントが 1 件保存される
 *
 * 結合境界: reportRoutes → reportFacade → ReportRepository → Firestore
 * 参照: docs/test-specs/report-feature.md U-R06
 */
describe('U-R06 週次報告の新規提出', () => {
  const testContext = setupReportFirestoreTests();

  it('putWeeklyReport_新卒が週次報告を提出_HTTP200かつFirestoreにsubmittedとして1件保存される', async () => {
    const response = await putWeeklyReport(
      U_R06_WEEK_KEY,
      U_R06_PUT_BODY,
      testContext.getRepository(),
    );

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        traineeId: TRAINEE_USER_ID,
        type: REPORT_TYPE_WEEKLY,
        periodKey: U_R06_WEEK_KEY,
        status: REPORT_STATUS_SUBMITTED,
        content: U_R06_WEEKLY_CONTENT,
        submittedAt: expect.any(String),
      }),
    );

    const submittedAt = (response.body as { submittedAt?: string }).submittedAt;
    expect(submittedAt).toBeTruthy();
    expect(() => new Date(submittedAt!).toISOString()).not.toThrow();

    const snapshot = await findWeeklyReportsInFirestore(
      testContext.getDb(),
      TRAINEE_USER_ID,
      U_R06_WEEK_KEY,
    );

    expectReportPersistedInCollection(snapshot, {
      traineeId: TRAINEE_USER_ID,
      type: REPORT_TYPE_WEEKLY,
      periodKey: U_R06_WEEK_KEY,
      content: U_R06_WEEKLY_CONTENT,
      status: REPORT_STATUS_SUBMITTED,
      submittedAt,
    });
  });
});

/**
 * U-R07: 提出済み週次報告の更新
 *
 * 前提条件: 新卒として認証済み。`2026-W31` の週次報告が `submitted` で保存済み
 * 入力値: 同一週に `reflection` を変更して `PUT`
 * 期待結果: HTTP 200。既存ドキュメントが更新され、件数は 1 件のまま
 *
 * 結合境界: reportRoutes → reportFacade → ReportRepository → Firestore
 * 参照: docs/test-specs/report-feature.md U-R07
 */
describe('U-R07 提出済み週次報告の更新', () => {
  const testContext = setupReportFirestoreTests();

  it('putWeeklyReport_提出済み週次報告のreflectionを更新_HTTP200かつFirestore件数は1件のまま', async () => {
    const initialResponse = await putWeeklyReport(
      U_R07_WEEK_KEY,
      U_R07_INITIAL_PUT_BODY,
      testContext.getRepository(),
    );

    expect(initialResponse.statusCode).toBe(200);

    const initialReportId = (initialResponse.body as { id: string }).id;

    const updateResponse = await putWeeklyReport(
      U_R07_WEEK_KEY,
      U_R07_UPDATED_PUT_BODY,
      testContext.getRepository(),
    );

    expect(updateResponse.statusCode).toBe(200);
    expect(updateResponse.body).toEqual(
      expect.objectContaining({
        id: initialReportId,
        traineeId: TRAINEE_USER_ID,
        type: REPORT_TYPE_WEEKLY,
        periodKey: U_R07_WEEK_KEY,
        status: REPORT_STATUS_SUBMITTED,
        content: U_R07_UPDATED_WEEKLY_CONTENT,
        submittedAt: expect.any(String),
      }),
    );

    const snapshot = await findWeeklyReportsInFirestore(
      testContext.getDb(),
      TRAINEE_USER_ID,
      U_R07_WEEK_KEY,
    );

    expectReportPersistedInCollection(snapshot, {
      id: initialReportId,
      traineeId: TRAINEE_USER_ID,
      type: REPORT_TYPE_WEEKLY,
      periodKey: U_R07_WEEK_KEY,
      content: U_R07_UPDATED_WEEKLY_CONTENT,
      status: REPORT_STATUS_SUBMITTED,
    });
    expect(
      (snapshot.docs[0]!.data().content as { reflection: string }).reflection,
    ).toBe(U_R07_UPDATED_WEEKLY_CONTENT.reflection);
  });
});

/**
 * U-R08: 週次報告の 1 週 1 件制約
 *
 * 前提条件: 新卒として認証済み。当該週の週次報告が既存
 * 入力値: 同一 `weekKey` に異なる内容で再度 `PUT`
 * 期待結果: 新規作成ではなく上書き更新となる。
 *           `traineeId + type + periodKey` の組み合わせで一意（§9 UNIQUE 制約）
 *
 * 結合境界: reportRoutes → reportFacade → ReportRepository → Firestore
 * 参照: docs/test-specs/report-feature.md U-R08
 */
describe('U-R08 週次報告の 1 週 1 件制約', () => {
  const testContext = setupReportFirestoreTests();

  it('putWeeklyReport_同一週に異なる内容をPUT_上書き更新され件数は1件のまま', async () => {
    const firstResponse = await putWeeklyReport(
      U_R08_WEEK_KEY,
      U_R08_FIRST_PUT_BODY,
      testContext.getRepository(),
    );

    expect(firstResponse.statusCode).toBe(200);

    const firstReportId = (firstResponse.body as { id: string }).id;
    const firstCreatedAt = (firstResponse.body as { createdAt: string })
      .createdAt;

    const secondResponse = await putWeeklyReport(
      U_R08_WEEK_KEY,
      U_R08_SECOND_PUT_BODY,
      testContext.getRepository(),
    );

    expect(secondResponse.statusCode).toBe(200);
    expect(secondResponse.body).toEqual(
      expect.objectContaining({
        id: firstReportId,
        traineeId: TRAINEE_USER_ID,
        type: REPORT_TYPE_WEEKLY,
        periodKey: U_R08_WEEK_KEY,
        status: REPORT_STATUS_SUBMITTED,
        content: U_R08_SECOND_WEEKLY_CONTENT,
      }),
    );
    expect((secondResponse.body as { createdAt: string }).createdAt).toBe(
      firstCreatedAt,
    );

    const snapshot = await findWeeklyReportsInFirestore(
      testContext.getDb(),
      TRAINEE_USER_ID,
      U_R08_WEEK_KEY,
    );

    expectReportPersistedInCollection(snapshot, {
      id: firstReportId,
      traineeId: TRAINEE_USER_ID,
      type: REPORT_TYPE_WEEKLY,
      periodKey: U_R08_WEEK_KEY,
      content: U_R08_SECOND_WEEKLY_CONTENT,
      status: REPORT_STATUS_SUBMITTED,
    });

    const uniqueKeys = snapshot.docs.map((document) => {
      const data = document.data();
      return buildReportUniquenessKey({
        traineeId: data.traineeId as string,
        type: data.type as typeof REPORT_TYPE_WEEKLY,
        periodKey: data.periodKey as string,
      });
    });

    expect(new Set(uniqueKeys).size).toBe(1);
    expect(uniqueKeys[0]).toBe(
      buildReportUniquenessKey({
        traineeId: TRAINEE_USER_ID,
        type: REPORT_TYPE_WEEKLY,
        periodKey: U_R08_WEEK_KEY,
      }),
    );
  });
});

/**
 * U-R09: 日次報告の必須項目欠落（提出時）
 *
 * 前提条件: 新卒として認証済み。当該日の日次報告は未作成
 * 入力値: `status: submitted` で `doneToday` を空のまま `PUT /api/reports/daily/2026-08-03`
 * 期待結果: HTTP 400。バリデーションエラーが返り、保存されない
 *
 * 結合境界: reportRoutes → reportFacade → ownedReportCommands バリデーション
 * 参照: docs/test-specs/report-feature.md U-R09
 */
describe('U-R09 日次報告の必須項目欠落（提出時）', () => {
  const testContext = setupReportFirestoreTests();

  it('putDailyReport_doneTodayが空のまま提出_HTTP400かつFirestoreに保存されない', async () => {
    const response = await putDailyReport(
      U_R09_DAILY_DATE,
      U_R09_PUT_BODY,
      testContext.getRepository(),
    );

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      error: 'Invalid report input',
    });

    const snapshot = await findDailyReportsInFirestore(
      testContext.getDb(),
      TRAINEE_USER_ID,
      U_R09_DAILY_DATE,
    );

    expect(snapshot.size).toBe(0);
  });
});

/**
 * U-R10: 週次報告の必須項目欠落（提出時）
 *
 * 前提条件: 新卒として認証済み。当該週の週次報告は未作成
 * 入力値: `status: submitted` で `reflection` を空のまま `PUT /api/reports/weekly/2026-W33`
 * 期待結果: HTTP 400。バリデーションエラーが返り、保存されない
 *
 * 結合境界: reportRoutes → reportFacade → ownedReportCommands バリデーション
 * 参照: docs/test-specs/report-feature.md U-R10（週キーは U-R06 との衝突回避のため 2026-W33 を使用）
 */
describe('U-R10 週次報告の必須項目欠落（提出時）', () => {
  const testContext = setupReportFirestoreTests();

  it('putWeeklyReport_reflectionが空のまま提出_HTTP400かつFirestoreに保存されない', async () => {
    const response = await putWeeklyReport(
      U_R10_WEEK_KEY,
      U_R10_PUT_BODY,
      testContext.getRepository(),
    );

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      error: 'Invalid report input',
    });

    const snapshot = await findWeeklyReportsInFirestore(
      testContext.getDb(),
      TRAINEE_USER_ID,
      U_R10_WEEK_KEY,
    );

    expect(snapshot.size).toBe(0);
  });
});

/**
 * U-R11: 日付形式の不正
 *
 * 前提条件: 新卒として認証済み
 * 入力値: `PUT /api/reports/daily/2026-13-40`（存在しない月日）に有効な報告 body を送信
 * 期待結果: HTTP 400。不正な日付として拒否され、保存されない
 *
 * 結合境界: reportRoutes → 日付（periodKey）バリデーション
 * 参照: docs/test-specs/report-feature.md U-R11
 */
describe('U-R11 日付形式の不正', () => {
  const testContext = setupReportFirestoreTests();

  it('putDailyReport_存在しない月日_HTTP400かつFirestoreに保存されない', async () => {
    const response = await putDailyReport(
      U_R11_INVALID_DAILY_DATE,
      U_R11_PUT_BODY,
      testContext.getRepository(),
    );

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      error: 'Invalid report input',
    });

    const snapshot = await findDailyReportsInFirestore(
      testContext.getDb(),
      TRAINEE_USER_ID,
      U_R11_INVALID_DAILY_DATE,
    );

    expect(snapshot.size).toBe(0);
  });
});

/**
 * U-R12: 週キー形式の不正
 *
 * 前提条件: 新卒として認証済み
 * 入力値: `PUT /api/reports/weekly/invalid-week` に有効な報告 body を送信
 * 期待結果: HTTP 400。不正な週キーとして拒否され、保存されない
 *
 * 結合境界: reportRoutes → 週キー（periodKey）バリデーション
 * 参照: docs/test-specs/report-feature.md U-R12
 */
describe('U-R12 週キー形式の不正', () => {
  const testContext = setupReportFirestoreTests();

  it('putWeeklyReport_不正な週キー_HTTP400かつFirestoreに保存されない', async () => {
    const response = await putWeeklyReport(
      U_R12_INVALID_WEEK_KEY,
      U_R12_PUT_BODY,
      testContext.getRepository(),
    );

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      error: 'Invalid report input',
    });

    const snapshot = await findWeeklyReportsInFirestore(
      testContext.getDb(),
      TRAINEE_USER_ID,
      U_R12_INVALID_WEEK_KEY,
    );

    expect(snapshot.size).toBe(0);
  });
});

/**
 * U-R13: 日次報告の取得（存在する）
 *
 * 前提条件: 新卒として認証済み。`2026-07-28` の日次報告が保存済み
 * 入力値: `GET /api/reports/daily/2026-07-28`
 * 期待結果: HTTP 200。`DailyReportContent` の全項目と `status` が返る
 *
 * 結合境界: reportRoutes → reportFacade → ownedReportCommands → ReportRepository
 * 参照: docs/test-specs/report-feature.md U-R13
 */
describe('U-R13 日次報告の取得（存在する）', () => {
  const testContext = setupReportFirestoreTests();

  it('getDailyReport_保存済み日次報告_HTTP200かつDailyReportContent全項目とstatusが返る', async () => {
    const putResponse = await putDailyReport(
      U_R13_DAILY_DATE,
      U_R13_PUT_BODY,
      testContext.getRepository(),
    );

    expect(putResponse.statusCode).toBe(200);

    const reportId = (putResponse.body as { id: string }).id;
    const submittedAt = (putResponse.body as { submittedAt?: string })
      .submittedAt;

    const getResponse = await getDailyReport(
      U_R13_DAILY_DATE,
      testContext.getRepository(),
    );

    expect(getResponse.statusCode).toBe(200);
    expect(getResponse.body).toEqual(
      expect.objectContaining({
        id: reportId,
        traineeId: TRAINEE_USER_ID,
        type: REPORT_TYPE_DAILY,
        periodKey: U_R13_DAILY_DATE,
        status: REPORT_STATUS_SUBMITTED,
        content: U_R13_DAILY_CONTENT,
        submittedAt,
      }),
    );
  });
});

/**
 * U-R14: 日次報告の取得（未作成）
 *
 * 前提条件: 新卒として認証済み。当該日の報告は未作成
 * 入力値: `GET /api/reports/daily/2026-07-01`
 * 期待結果: HTTP 200 で空、または HTTP 404。いずれにせよ未作成と判別できること
 *
 * 結合境界: reportRoutes → reportFacade → ownedReportCommands → ReportRepository
 * 参照: docs/test-specs/report-feature.md U-R14
 *       （※確認事項 3: 未作成時の 200 空 / 404 は未確定のため両方を許容）
 */
describe('U-R14 日次報告の取得（未作成）', () => {
  const testContext = setupReportFirestoreTests();

  it('getDailyReport_当該日の報告が未作成_HTTP200空またはHTTP404で未作成と判別できる', async () => {
    const response = await getDailyReport(
      U_R14_DAILY_DATE,
      testContext.getRepository(),
    );

    const isNotFound = response.statusCode === 404;
    const isEmptyOk =
      response.statusCode === 200 &&
      (response.body === null ||
        response.body === undefined ||
        response.body === '');

    expect(isNotFound || isEmptyOk).toBe(true);

    if (isNotFound) {
      expect(response.body).toEqual({
        error: 'Not found',
      });
    }

    const snapshot = await findDailyReportsInFirestore(
      testContext.getDb(),
      TRAINEE_USER_ID,
      U_R14_DAILY_DATE,
    );

    expect(snapshot.size).toBe(0);
  });
});

/**
 * U-R15: 新卒による報告一覧 API 呼び出し
 *
 * 前提条件: 新卒として認証済み
 * 入力値: `GET /api/reports?traineeId=trainee-1`
 * 期待結果: HTTP 403。トレーナー専用 API へのアクセスが拒否される
 *
 * 結合境界: reportRoutes → reportFacade → トレーナー認可
 * 参照: docs/test-specs/report-feature.md U-R15
 */
describe('U-R15 新卒による報告一覧 API 呼び出し', () => {
  const testContext = setupReportFirestoreTests();

  it('getReports_新卒が報告一覧APIを呼び出し_HTTP403で拒否される', async () => {
    const response = await getReports(
      { traineeId: U_R15_LIST_TRAINEE_ID },
      testContext.getRepository(),
    );

    expect(response.statusCode).toBe(403);
    expect(response.body).toEqual({
      error: 'Forbidden',
    });
  });
});

/**
 * U-R16: トレーナーによる報告一覧取得
 *
 * 前提条件: トレーナー（`trainer-1`）として認証済み。
 *           担当新卒 `trainee-1` に日次・週次報告が複数存在
 * 入力値: `GET /api/reports?traineeId=trainee-1`
 * 期待結果: HTTP 200。担当新卒の報告一覧が返る。未読・最新順でソートされる（UC-R04）
 *
 * 結合境界: reportRoutes → reportFacade → reportReadCommands → ReportRepository
 * 参照: docs/test-specs/report-feature.md U-R16
 *       （※確認事項 6: 未読定義は未確定のため、実装済みなら未読優先を検証し、
 *        常に updatedAt 降順（最新順）を検証する）
 */
describe('U-R16 トレーナーによる報告一覧取得', () => {
  const testContext = setupReportFirestoreTests();

  it('getReports_トレーナーが担当新卒の報告一覧を取得_HTTP200かつ日次週次が最新順で返る', async () => {
    const olderDaily = await putDailyReport(
      U_R16_DAILY_DATE_OLDER,
      U_R16_DAILY_PUT_BODY,
      testContext.getRepository(),
    );
    const olderWeekly = await putWeeklyReport(
      U_R16_WEEK_KEY_OLDER,
      U_R16_WEEKLY_PUT_BODY,
      testContext.getRepository(),
    );
    const newerDaily = await putDailyReport(
      U_R16_DAILY_DATE_NEWER,
      U_R16_DAILY_PUT_BODY,
      testContext.getRepository(),
    );
    const newerWeekly = await putWeeklyReport(
      U_R16_WEEK_KEY_NEWER,
      U_R16_WEEKLY_PUT_BODY,
      testContext.getRepository(),
    );

    expect(olderDaily.statusCode).toBe(200);
    expect(olderWeekly.statusCode).toBe(200);
    expect(newerDaily.statusCode).toBe(200);
    expect(newerWeekly.statusCode).toBe(200);

    const response = await getReports(
      { traineeId: U_R16_LIST_TRAINEE_ID },
      testContext.getRepository(),
      TRAINER_HEADERS,
    );

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);

    const reports = response.body as Array<{
      id: string;
      traineeId: string;
      type: string;
      periodKey: string;
      status: string;
      updatedAt: string;
      isRead?: boolean;
      unread?: boolean;
    }>;

    expect(reports).toHaveLength(4);
    expect(
      reports.every((report) => report.traineeId === TRAINEE_USER_ID),
    ).toBe(true);

    const periodKeys = reports.map((report) => report.periodKey);
    expect(periodKeys).toEqual(
      expect.arrayContaining([
        U_R16_DAILY_DATE_OLDER,
        U_R16_DAILY_DATE_NEWER,
        U_R16_WEEK_KEY_OLDER,
        U_R16_WEEK_KEY_NEWER,
      ]),
    );
    expect(reports.some((report) => report.type === REPORT_TYPE_DAILY)).toBe(
      true,
    );
    expect(reports.some((report) => report.type === REPORT_TYPE_WEEKLY)).toBe(
      true,
    );

    const updatedAts = reports.map((report) => report.updatedAt);
    const sortedByNewest = [...updatedAts].sort((left, right) =>
      right.localeCompare(left),
    );
    expect(updatedAts).toEqual(sortedByNewest);

    const hasUnreadFlag = reports.some(
      (report) =>
        typeof report.isRead === 'boolean' ||
        typeof report.unread === 'boolean',
    );

    if (hasUnreadFlag) {
      const unreadIndex = reports.findIndex(
        (report) => report.isRead === false || report.unread === true,
      );
      const readIndex = reports.findIndex(
        (report) => report.isRead === true || report.unread === false,
      );

      if (unreadIndex !== -1 && readIndex !== -1) {
        expect(unreadIndex).toBeLessThan(readIndex);
      }
    }
  });
});

/**
 * U-R17: トレーナーによる報告詳細取得
 *
 * 前提条件: トレーナーとして認証済み。担当新卒の報告 ID が既知
 * 入力値: `GET /api/reports/:id`
 * 期待結果: HTTP 200。報告の全項目（`content`, `status`, `periodKey`, `type` 等）が返る
 *
 * 結合境界: reportRoutes → reportFacade → reportReadCommands → ReportRepository
 * 参照: docs/test-specs/report-feature.md U-R17
 */
describe('U-R17 トレーナーによる報告詳細取得', () => {
  const testContext = setupReportFirestoreTests();

  it('getReportById_トレーナーが担当新卒の報告詳細を取得_HTTP200かつ全項目が返る', async () => {
    const putResponse = await putDailyReport(
      U_R17_DAILY_DATE,
      U_R17_PUT_BODY,
      testContext.getRepository(),
    );

    expect(putResponse.statusCode).toBe(200);

    const reportId = (putResponse.body as { id: string }).id;
    const submittedAt = (putResponse.body as { submittedAt?: string })
      .submittedAt;

    const response = await getReportById(
      reportId,
      testContext.getRepository(),
      TRAINER_HEADERS,
    );

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        id: reportId,
        traineeId: TRAINEE_USER_ID,
        type: REPORT_TYPE_DAILY,
        periodKey: U_R17_DAILY_DATE,
        status: REPORT_STATUS_SUBMITTED,
        content: U_R17_DAILY_CONTENT,
        submittedAt,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      }),
    );
  });
});

/**
 * U-R18: 新卒による自分の報告詳細取得
 *
 * 前提条件: 新卒として認証済み。自身の報告 ID が既知
 * 入力値: `GET /api/reports/:id`
 * 期待結果: HTTP 200。自身の報告内容が返る
 *
 * 結合境界: reportRoutes → reportFacade → reportReadCommands → ReportRepository
 * 参照: docs/test-specs/report-feature.md U-R18
 */
describe('U-R18 新卒による自分の報告詳細取得', () => {
  const testContext = setupReportFirestoreTests();

  it('getReportById_新卒が自身の報告詳細を取得_HTTP200かつ報告内容が返る', async () => {
    const putResponse = await putDailyReport(
      U_R18_DAILY_DATE,
      U_R18_PUT_BODY,
      testContext.getRepository(),
    );

    expect(putResponse.statusCode).toBe(200);

    const reportId = (putResponse.body as { id: string }).id;
    const submittedAt = (putResponse.body as { submittedAt?: string })
      .submittedAt;

    const response = await getReportById(reportId, testContext.getRepository());

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        id: reportId,
        traineeId: TRAINEE_USER_ID,
        type: REPORT_TYPE_DAILY,
        periodKey: U_R18_DAILY_DATE,
        status: REPORT_STATUS_SUBMITTED,
        content: U_R18_DAILY_CONTENT,
        submittedAt,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      }),
    );
  });
});

/**
 * U-R19: 新卒による他者の報告詳細取得
 *
 * 前提条件: 新卒（`trainee-1`）として認証済み。`trainee-2` の報告 ID が既知
 * 入力値: `GET /api/reports/:id`（他者の報告）
 * 期待結果: HTTP 403 または 404。他者の報告は取得できない
 *
 * 結合境界: reportRoutes → reportFacade → reportReadCommands → ReportRepository
 * 参照: docs/test-specs/report-feature.md U-R19
 */
describe('U-R19 新卒による他者の報告詳細取得', () => {
  const testContext = setupReportFirestoreTests();

  it('getReportById_新卒が他者の報告詳細を取得_HTTP403または404で拒否される', async () => {
    const putResponse = await putDailyReport(
      U_R19_OTHER_TRAINEE_DAILY_DATE,
      U_R19_OTHER_TRAINEE_PUT_BODY,
      testContext.getRepository(),
      OTHER_TRAINEE_HEADERS,
    );

    expect(putResponse.statusCode).toBe(200);

    const reportId = (putResponse.body as { id: string }).id;
    expect((putResponse.body as { traineeId: string }).traineeId).toBe(
      OTHER_TRAINEE_USER_ID,
    );

    const response = await getReportById(reportId, testContext.getRepository());

    expect([403, 404]).toContain(response.statusCode);

    if (response.statusCode === 403) {
      expect(response.body).toEqual({
        error: 'Forbidden',
      });
    } else {
      expect(response.body).toEqual({
        error: 'Not found',
      });
    }

    expect(response.body).not.toEqual(
      expect.objectContaining({
        id: reportId,
        traineeId: OTHER_TRAINEE_USER_ID,
        content: U_R19_OTHER_TRAINEE_DAILY_CONTENT,
      }),
    );

    const snapshot = await findDailyReportsInFirestore(
      testContext.getDb(),
      OTHER_TRAINEE_USER_ID,
      U_R19_OTHER_TRAINEE_DAILY_DATE,
    );

    expect(snapshot.size).toBe(1);
  });
});

/**
 * U-R20: トレーナーによる日次報告の作成
 *
 * 前提条件: トレーナーとして認証済み
 * 入力値: `PUT /api/reports/daily/2026-07-28` に報告内容を送信
 * 期待結果: HTTP 403。トレーナーは新卒報告の作成・更新不可
 *
 * 結合境界: reportRoutes → reportFacade → ownedReportCommands → ensureTrainee
 * 参照: docs/test-specs/report-feature.md U-R20
 */
describe('U-R20 トレーナーによる日次報告の作成', () => {
  const testContext = setupReportFirestoreTests();

  it('putDailyReport_トレーナーが日次報告を作成_HTTP403で拒否され保存されない', async () => {
    const response = await putDailyReport(
      U_R20_DAILY_DATE,
      U_R20_PUT_BODY,
      testContext.getRepository(),
      TRAINER_HEADERS,
    );

    expect(response.statusCode).toBe(403);
    expect(response.body).toEqual({
      error: 'Forbidden',
    });

    await expectNoDailyReportSaved(testContext.getDb(), U_R20_DAILY_DATE, [
      TRAINEE_USER_ID,
      TRAINER_USER_ID,
    ]);
  });
});

/**
 * U-R21: 未認証アクセス
 *
 * 前提条件: 認証ヘッダーなし
 * 入力値: `GET /api/reports/daily/2026-07-28`
 * 期待結果: HTTP 401。未認証として拒否される
 *
 * 結合境界: reportRoutes → runReportRoute → readExpressUserContext
 * 参照: docs/test-specs/report-feature.md U-R21
 */
describe('U-R21 未認証アクセス', () => {
  const testContext = setupReportFirestoreTests();

  it('getDailyReport_認証ヘッダーなし_HTTP401で拒否される', async () => {
    const response = await getDailyReport(
      U_R21_DAILY_DATE,
      testContext.getRepository(),
      UNAUTHENTICATED_HEADERS,
    );

    expect(response.statusCode).toBe(401);
    expect(response.body).toEqual({
      error: 'Unauthorized',
    });
  });
});

/**
 * U-R22: 不正な status 値
 *
 * 前提条件: 新卒として認証済み
 * 入力値: `status: "published"` を指定して `PUT`
 * 期待結果: HTTP 400。`submitted` 以外（`draft` を含む）は拒否される
 *
 * 結合境界: reportRoutes → parsePutDailyReportBody → isReportStatus
 * 参照: docs/test-specs/report-feature.md U-R22
 */
describe('U-R22 不正な status 値', () => {
  const testContext = setupReportFirestoreTests();

  it('putDailyReport_statusがpublished_HTTP400で拒否され保存されない', async () => {
    const response = await putDailyReport(
      U_R22_DAILY_DATE,
      U_R22_INVALID_STATUS_PUT_BODY,
      testContext.getRepository(),
    );

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      error: 'Invalid report input',
    });

    const snapshot = await findDailyReportsInFirestore(
      testContext.getDb(),
      TRAINEE_USER_ID,
      U_R22_DAILY_DATE,
    );

    expect(snapshot.size).toBe(0);
  });
});

/**
 * U-R23: テキスト項目の最大長
 *
 * 前提条件: 新卒として認証済み
 * 入力値: 各テキスト項目に最大許容文字数ちょうどの文字列を送信
 * 期待結果: HTTP 200。正常に保存される
 *
 * 結合境界: reportRoutes → reportFacade → ownedReportCommands → ReportRepository
 * 参照: docs/test-specs/report-feature.md U-R23
 *       （※確認事項 2: 最大文字数未確定のため、テスト契約として
 *        REPORT_CONTENT_FIELD_MAX_LENGTH=2000 を採用）
 */
describe('U-R23 テキスト項目の最大長', () => {
  const testContext = setupReportFirestoreTests();

  it('putDailyReport_各項目が最大長ちょうど_HTTP200かつFirestoreに保存される', async () => {
    expect(
      Object.values(U_R23_DAILY_CONTENT).every(
        (value) => value.length === REPORT_CONTENT_FIELD_MAX_LENGTH,
      ),
    ).toBe(true);

    const response = await putDailyReport(
      U_R23_DAILY_DATE,
      U_R23_PUT_BODY,
      testContext.getRepository(),
    );

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        traineeId: TRAINEE_USER_ID,
        type: REPORT_TYPE_DAILY,
        periodKey: U_R23_DAILY_DATE,
        status: REPORT_STATUS_SUBMITTED,
        content: U_R23_DAILY_CONTENT,
        submittedAt: expect.any(String),
      }),
    );

    const snapshot = await findDailyReportsInFirestore(
      testContext.getDb(),
      TRAINEE_USER_ID,
      U_R23_DAILY_DATE,
    );

    expectReportPersistedInCollection(snapshot, {
      traineeId: TRAINEE_USER_ID,
      type: REPORT_TYPE_DAILY,
      periodKey: U_R23_DAILY_DATE,
      content: U_R23_DAILY_CONTENT,
      status: REPORT_STATUS_SUBMITTED,
    });
  });
});

/**
 * U-R24: テキスト項目の最大長超過
 *
 * 前提条件: 新卒として認証済み
 * 入力値: いずれかのテキスト項目に最大許容文字数 + 1 文字を送信
 * 期待結果: HTTP 400。バリデーションエラーが返る
 *
 * 結合境界: reportRoutes → reportFacade → validateOwnedReportPutInput
 * 参照: docs/test-specs/report-feature.md U-R24
 *       （※確認事項 2: REPORT_CONTENT_FIELD_MAX_LENGTH=2000）
 */
describe('U-R24 テキスト項目の最大長超過', () => {
  const testContext = setupReportFirestoreTests();

  it('putDailyReport_doneTodayが最大長超過_HTTP400で拒否され保存されない', async () => {
    expect(U_R24_DAILY_CONTENT.doneToday.length).toBe(
      REPORT_CONTENT_FIELD_MAX_LENGTH + 1,
    );

    const response = await putDailyReport(
      U_R24_DAILY_DATE,
      U_R24_PUT_BODY,
      testContext.getRepository(),
    );

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      error: 'Invalid report input',
    });

    const snapshot = await findDailyReportsInFirestore(
      testContext.getDb(),
      TRAINEE_USER_ID,
      U_R24_DAILY_DATE,
    );

    expect(snapshot.size).toBe(0);
  });
});

/**
 * U-R25: 全項目空文字列での提出は拒否される（下書き廃止 / BR-R03）
 *
 * 前提条件: 新卒として認証済み
 * 入力値: `status: submitted` で全テキスト項目を空文字で `PUT`
 * 期待結果: HTTP 400。下書きが廃止されたため、提出時は全項目が必須となり拒否される
 *
 * 結合境界: reportRoutes → reportFacade → validateOwnedReportPutInput → ReportRepository
 * 参照: docs/test-specs/report-feature.md U-R25
 */
describe('U-R25 全項目空文字列での提出は拒否される', () => {
  const testContext = setupReportFirestoreTests();

  it('putDailyReport_全項目空文字で提出_HTTP400で拒否され保存されない', async () => {
    expect(
      Object.values(U_R25_EMPTY_DAILY_CONTENT).every((value) => value === ''),
    ).toBe(true);

    const response = await putDailyReport(
      U_R25_DAILY_DATE,
      U_R25_PUT_BODY,
      testContext.getRepository(),
    );

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      error: 'Invalid report input',
    });

    const snapshot = await findDailyReportsInFirestore(
      testContext.getDb(),
      TRAINEE_USER_ID,
      U_R25_DAILY_DATE,
    );

    expect(snapshot.size).toBe(0);
  });
});

/**
 * I-R01: Firestore 永続化の往復
 *
 * 前提条件: API サーバーと Firestore エミュレータが起動済み
 * 入力値: 日次報告を `PUT` 後、Firestore から直接読み取り
 * 期待結果: `reports` コレクションに `traineeId`, `type`, `periodKey`,
 *           `content`, `status` が期待どおり保存されている
 *
 * 結合境界: reportRoutes → reportFacade → ReportRepository → Firestore Emulator
 * 参照: docs/test-specs/report-feature.md I-R01
 */
describe('I-R01 Firestore 永続化の往復', () => {
  const testContext = setupReportFirestoreTests();

  it('putDailyReport後_Firestoreのreportsコレクションから直接読み取り_永続化フィールドが一致する', async () => {
    const response = await putDailyReport(
      I_R01_DAILY_DATE,
      I_R01_PUT_BODY,
      testContext.getRepository(),
    );

    expect(response.statusCode).toBe(200);

    const snapshot = await findDailyReportsInFirestore(
      testContext.getDb(),
      TRAINEE_USER_ID,
      I_R01_DAILY_DATE,
    );

    expectReportPersistedInCollection(snapshot, {
      traineeId: TRAINEE_USER_ID,
      type: REPORT_TYPE_DAILY,
      periodKey: I_R01_DAILY_DATE,
      content: I_R01_DAILY_CONTENT,
      status: REPORT_STATUS_SUBMITTED,
    });
  });
});

/**
 * I-R02: 報告取得 API と Firestore の整合
 *
 * 前提条件: 日次報告が Firestore に保存済み
 * 入力値: `GET /api/reports/daily/:date`
 * 期待結果: API レスポンスと Firestore の内容が一致する
 *
 * 結合境界: reportRoutes → reportFacade → ReportRepository → Firestore Emulator
 *           （GET 応答）と Firestore 直接読み取りの整合
 * 参照: docs/test-specs/report-feature.md I-R02
 */
describe('I-R02 報告取得 API と Firestore の整合', () => {
  const testContext = setupReportFirestoreTests();

  it('getDailyReport_Firestoreに保存済みの日次報告_APIレスポンスとFirestoreの内容が一致する', async () => {
    const putResponse = await putDailyReport(
      I_R02_DAILY_DATE,
      I_R02_PUT_BODY,
      testContext.getRepository(),
    );

    expect(putResponse.statusCode).toBe(200);

    const snapshot = await findDailyReportsInFirestore(
      testContext.getDb(),
      TRAINEE_USER_ID,
      I_R02_DAILY_DATE,
    );
    const stored = readSingleReportDocument(snapshot);

    const getResponse = await getDailyReport(
      I_R02_DAILY_DATE,
      testContext.getRepository(),
    );

    expect(getResponse.statusCode).toBe(200);
    expectApiResponseMatchesStoredReport(getResponse.body, stored);
  });
});

/**
 * I-R03: 報告一覧のフィルタ（日次のみ）
 *
 * 前提条件: 担当新卒に日次・週次報告が混在
 * 入力値: `GET /api/reports?traineeId=trainee-1&type=daily`
 * 期待結果: 日次報告のみが返る
 *
 * 結合境界: reportRoutes → parseListReportsQuery → reportFacade →
 *           reportReadCommands → ReportRepository → Firestore Emulator
 * 参照: docs/test-specs/report-feature.md I-R03
 */
describe('I-R03 報告一覧のフィルタ（日次のみ）', () => {
  const testContext = setupReportFirestoreTests();

  it('getReports_type=daily指定_日次報告のみが返り週次は含まれない', async () => {
    await seedMixedDailyAndWeeklyReports(testContext.getRepository(), {
      dailyDates: [I_R03_DAILY_DATE_A, I_R03_DAILY_DATE_B],
      weekKeys: [I_R03_WEEK_KEY],
      dailyBody: I_R03_DAILY_PUT_BODY,
      weeklyBody: I_R03_WEEKLY_PUT_BODY,
    });

    await expectTrainerReportsFilteredByType(testContext.getRepository(), {
      traineeId: I_R03_LIST_TRAINEE_ID,
      type: REPORT_TYPE_DAILY,
      periodKeys: [I_R03_DAILY_DATE_A, I_R03_DAILY_DATE_B],
    });
  });
});

/**
 * I-R04: 報告一覧のフィルタ（週次のみ）
 *
 * 前提条件: 担当新卒に日次・週次報告が混在
 * 入力値: `GET /api/reports?traineeId=trainee-1&type=weekly`
 * 期待結果: 週次報告のみが返る
 *
 * 結合境界: reportRoutes → parseListReportsQuery → reportFacade →
 *           reportReadCommands → ReportRepository → Firestore Emulator
 * 参照: docs/test-specs/report-feature.md I-R04
 */
describe('I-R04 報告一覧のフィルタ（週次のみ）', () => {
  const testContext = setupReportFirestoreTests();

  it('getReports_type=weekly指定_週次報告のみが返り日次は含まれない', async () => {
    await seedMixedDailyAndWeeklyReports(testContext.getRepository(), {
      dailyDates: [I_R04_DAILY_DATE],
      weekKeys: [I_R04_WEEK_KEY_A, I_R04_WEEK_KEY_B],
      dailyBody: I_R04_DAILY_PUT_BODY,
      weeklyBody: I_R04_WEEKLY_PUT_BODY,
    });

    await expectTrainerReportsFilteredByType(testContext.getRepository(), {
      traineeId: I_R04_LIST_TRAINEE_ID,
      type: REPORT_TYPE_WEEKLY,
      periodKeys: [I_R04_WEEK_KEY_A, I_R04_WEEK_KEY_B],
    });
  });
});

/**
 * I-R05: 担当外新卒の報告一覧取得
 *
 * 前提条件: トレーナーとして認証済み。`trainee-2` は当該トレーナーの担当外
 * 入力値: `GET /api/reports?traineeId=trainee-2`
 * 期待結果: HTTP 403 または空一覧。担当外新卒の報告は閲覧できない
 *
 * 結合境界: reportRoutes → reportFacade → reportReadCommands
 *           （担当関係の認可）→ ReportRepository → Firestore Emulator
 * 参照: docs/test-specs/report-feature.md I-R05
 *       （※確認事項 7: 担当外時の 403 / 空一覧は未確定のため両方を許容）
 */
describe('I-R05 担当外新卒の報告一覧取得', () => {
  const testContext = setupReportFirestoreTests();

  it('getReports_担当外traineeId指定_HTTP403または空一覧で担当外報告を返せない', async () => {
    const putResponse = await putDailyReport(
      I_R05_DAILY_DATE,
      I_R05_PUT_BODY,
      testContext.getRepository(),
      OTHER_TRAINEE_HEADERS,
    );

    expect(putResponse.statusCode).toBe(200);
    expect((putResponse.body as { traineeId: string }).traineeId).toBe(
      OTHER_TRAINEE_USER_ID,
    );

    const response = await getReports(
      { traineeId: I_R05_LIST_TRAINEE_ID },
      testContext.getRepository(),
      TRAINER_HEADERS,
    );

    expectForbiddenOrEmptyReportList(response, {
      deniedTraineeId: OTHER_TRAINEE_USER_ID,
      deniedPeriodKey: I_R05_DAILY_DATE,
    });

    const snapshot = await findDailyReportsInFirestore(
      testContext.getDb(),
      OTHER_TRAINEE_USER_ID,
      I_R05_DAILY_DATE,
    );

    expect(snapshot.size).toBe(1);
  });
});

/**
 * I-R06: 新卒・日次一覧の本文全体検索
 * 参照: docs/test-specs/report-feature.md I-R06
 */
describe('I-R06 新卒・日次一覧の本文全体検索', () => {
  const testContext = setupReportFirestoreTests();

  it('getOwnDailyReports_qで本文語指定_当該語を含む日次報告のみが返る', async () => {
    await putDailyReport(
      I_R06_MATCH_DATE,
      I_R06_MATCH_PUT_BODY,
      testContext.getRepository(),
    );
    await putDailyReport(
      I_R06_OTHER_DATE,
      I_R06_OTHER_PUT_BODY,
      testContext.getRepository(),
    );

    const response = await getOwnDailyReports(
      { q: I_R06_SEARCH_TERM },
      testContext.getRepository(),
      TRAINEE_HEADERS,
    );

    expect(response.statusCode).toBe(200);
    const reports = response.body as Array<{ periodKey: string }>;
    expect(reports.map((report) => report.periodKey)).toEqual([
      I_R06_MATCH_DATE,
    ]);
  });
});

/**
 * I-R07: 新卒・日次一覧の期間絞り込み（from/to）
 * 参照: docs/test-specs/report-feature.md I-R07
 */
describe('I-R07 新卒・日次一覧の期間絞り込み（from/to）', () => {
  const testContext = setupReportFirestoreTests();

  it('getOwnDailyReports_fromとto指定_指定期間内の日次報告のみが返る', async () => {
    await putDailyReport(
      I_R07_IN_RANGE_DATE,
      U_R01_PUT_BODY,
      testContext.getRepository(),
    );
    await putDailyReport(
      I_R07_OUT_RANGE_DATE,
      U_R01_PUT_BODY,
      testContext.getRepository(),
    );

    const response = await getOwnDailyReports(
      { from: I_R07_FROM, to: I_R07_TO },
      testContext.getRepository(),
      TRAINEE_HEADERS,
    );

    expect(response.statusCode).toBe(200);
    const reports = response.body as Array<{ periodKey: string }>;
    expect(reports.map((report) => report.periodKey)).toEqual([
      I_R07_IN_RANGE_DATE,
    ]);
  });
});

/**
 * I-R08: 新卒・日次一覧の特定日絞り込み
 * 参照: docs/test-specs/report-feature.md I-R08
 */
describe('I-R08 新卒・日次一覧の特定日絞り込み', () => {
  const testContext = setupReportFirestoreTests();

  it('getOwnDailyReports_date指定_当該日の報告のみが返る', async () => {
    await putDailyReport(
      I_R08_TARGET_DATE,
      U_R01_PUT_BODY,
      testContext.getRepository(),
    );
    await putDailyReport(
      I_R08_OTHER_DATE,
      U_R01_PUT_BODY,
      testContext.getRepository(),
    );

    const response = await getOwnDailyReports(
      { date: I_R08_TARGET_DATE },
      testContext.getRepository(),
      TRAINEE_HEADERS,
    );

    expect(response.statusCode).toBe(200);
    const reports = response.body as Array<{ periodKey: string }>;
    expect(reports.map((report) => report.periodKey)).toEqual([
      I_R08_TARGET_DATE,
    ]);
  });
});

/**
 * I-R09: 新卒・週次一覧の検索・期間絞り込み
 * 参照: docs/test-specs/report-feature.md I-R09
 */
describe('I-R09 新卒・週次一覧の検索・期間絞り込み', () => {
  const testContext = setupReportFirestoreTests();

  it('getOwnWeeklyReports_q指定_条件に一致する週次報告のみが返る', async () => {
    await putWeeklyReport(
      I_R09_WEEK_MATCH,
      I_R09_MATCH_PUT_BODY,
      testContext.getRepository(),
    );
    await putWeeklyReport(
      I_R09_WEEK_OTHER,
      I_R09_OTHER_PUT_BODY,
      testContext.getRepository(),
    );

    const response = await getOwnWeeklyReports(
      { q: I_R09_SEARCH_TERM },
      testContext.getRepository(),
      TRAINEE_HEADERS,
    );

    expect(response.statusCode).toBe(200);
    const reports = response.body as Array<{ periodKey: string }>;
    expect(reports.map((report) => report.periodKey)).toEqual([
      I_R09_WEEK_MATCH,
    ]);
  });
});

/**
 * I-R10: 週次一覧の日付指定（含む週）
 * 参照: docs/test-specs/report-feature.md I-R10
 */
describe('I-R10 週次一覧の日付指定（含む週）', () => {
  const testContext = setupReportFirestoreTests();

  it('getOwnWeeklyReports_dateが日付_当該週の週次報告が返る', async () => {
    await putWeeklyReport(
      I_R10_WEEK_KEY,
      U_R06_PUT_BODY,
      testContext.getRepository(),
    );

    const response = await getOwnWeeklyReports(
      { date: I_R10_DATE_IN_WEEK },
      testContext.getRepository(),
      TRAINEE_HEADERS,
    );

    expect(response.statusCode).toBe(200);
    const reports = response.body as Array<{ periodKey: string }>;
    expect(reports.map((report) => report.periodKey)).toEqual([I_R10_WEEK_KEY]);
  });
});

/**
 * I-R11: 週次一覧の週キー指定
 * 参照: docs/test-specs/report-feature.md I-R11
 */
describe('I-R11 週次一覧の週キー指定', () => {
  const testContext = setupReportFirestoreTests();

  it('getOwnWeeklyReports_dateが週キー_当該週の週次報告が返る', async () => {
    await putWeeklyReport(
      I_R10_WEEK_KEY,
      U_R06_PUT_BODY,
      testContext.getRepository(),
    );

    const response = await getOwnWeeklyReports(
      { date: I_R10_WEEK_KEY },
      testContext.getRepository(),
      TRAINEE_HEADERS,
    );

    expect(response.statusCode).toBe(200);
    const reports = response.body as Array<{ periodKey: string }>;
    expect(reports.map((report) => report.periodKey)).toEqual([I_R10_WEEK_KEY]);
  });
});

/**
 * I-R12: 期間条件の同時指定
 * 参照: docs/test-specs/report-feature.md I-R12
 */
describe('I-R12 期間条件の同時指定', () => {
  const testContext = setupReportFirestoreTests();

  it('getOwnDailyReports_fromとtoとdate同時指定_HTTP400と排他メッセージ', async () => {
    const response = await getOwnDailyReports(
      { from: I_R12_FROM, to: I_R12_TO, date: I_R12_DATE },
      testContext.getRepository(),
      TRAINEE_HEADERS,
    );

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      error: REPORT_PERIOD_FILTER_CONFLICT_MESSAGE,
    });
  });

  it('getOwnWeeklyReports_fromとtoとdate同時指定_HTTP400と排他メッセージ', async () => {
    const response = await getOwnWeeklyReports(
      { from: I_R12_FROM, to: I_R12_TO, date: I_R12_DATE },
      testContext.getRepository(),
      TRAINEE_HEADERS,
    );

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      error: REPORT_PERIOD_FILTER_CONFLICT_MESSAGE,
    });
  });
});
