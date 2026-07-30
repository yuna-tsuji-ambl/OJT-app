import type {
  DocumentData,
  Firestore,
  QuerySnapshot,
} from '@google-cloud/firestore';
import { expect } from 'vitest';
import { getFirestore, resetFirestoreForTests } from '../firestore/client.js';
import { FirestoreReportRepository } from '../repositories/firestore/firestoreReportRepository.js';
import type { ReportRepository } from '../repositories/reportRepository.js';
import { FIRESTORE_COLLECTIONS } from '../firestore/collections.js';
import {
  REPORT_TYPE_DAILY,
  REPORT_TYPE_WEEKLY,
  type ReportType,
} from '../reports/reportConstants.js';
import { ensureFirestoreEmulatorEnv } from './firestoreEmulatorEnv.js';
import {
  TRAINER_HEADERS,
  getReports,
  putDailyReport,
  putWeeklyReport,
} from './reportTestFixtures.js';

export interface ReportFirestoreTestContext {
  db: Firestore;
  repository: ReportRepository;
}

export interface ReportPersistenceFields {
  traineeId: string;
  type: ReportType;
  periodKey: string;
  content: unknown;
  status: string;
  id?: string;
  submittedAt?: unknown;
}

/** API レスポンスと Firestore ドキュメントで突き合わせる永続化フィールド */
const REPORT_API_FIRESTORE_ALIGNMENT_FIELDS = [
  'id',
  'traineeId',
  'type',
  'periodKey',
  'content',
  'status',
  'submittedAt',
  'createdAt',
  'updatedAt',
] as const;

export function createReportFirestoreTestContext(): ReportFirestoreTestContext {
  ensureFirestoreEmulatorEnv();
  resetFirestoreForTests();
  const db = getFirestore();

  return {
    db,
    repository: new FirestoreReportRepository(db),
  };
}

export function resetReportFirestoreTestContext(): void {
  resetFirestoreForTests();
}

export async function clearReportsCollection(db: Firestore): Promise<void> {
  const snapshot = await db.collection(FIRESTORE_COLLECTIONS.REPORTS).get();
  await Promise.all(snapshot.docs.map((document) => document.ref.delete()));
}

async function findReportsInFirestore(
  db: Firestore,
  traineeId: string,
  reportType: ReportType,
  periodKey: string,
): Promise<QuerySnapshot> {
  return db
    .collection(FIRESTORE_COLLECTIONS.REPORTS)
    .where('traineeId', '==', traineeId)
    .where('type', '==', reportType)
    .where('periodKey', '==', periodKey)
    .get();
}

export async function findDailyReportsInFirestore(
  db: Firestore,
  traineeId: string,
  periodKey: string,
): Promise<QuerySnapshot> {
  return findReportsInFirestore(db, traineeId, REPORT_TYPE_DAILY, periodKey);
}

export async function findWeeklyReportsInFirestore(
  db: Firestore,
  traineeId: string,
  periodKey: string,
): Promise<QuerySnapshot> {
  return findReportsInFirestore(db, traineeId, REPORT_TYPE_WEEKLY, periodKey);
}

export async function expectNoDailyReportSaved(
  db: Firestore,
  periodKey: string,
  traineeIds: readonly string[],
): Promise<void> {
  for (const traineeId of traineeIds) {
    const snapshot = await findDailyReportsInFirestore(
      db,
      traineeId,
      periodKey,
    );
    expect(snapshot.size).toBe(0);
  }
}

export function expectReportPersistedInCollection(
  snapshot: QuerySnapshot,
  expected: ReportPersistenceFields,
): void {
  const stored = readSingleReportDocument(snapshot);
  expect(stored).toEqual(expect.objectContaining(expected));
}

export function readSingleReportDocument(
  snapshot: QuerySnapshot,
): DocumentData {
  expect(snapshot.size).toBe(1);

  const document = snapshot.docs[0]!;
  expect(document.ref.parent.id).toBe(FIRESTORE_COLLECTIONS.REPORTS);
  return document.data();
}

/**
 * GET API レスポンスと Firestore 保存内容の整合を検証する（I-R02）。
 */
export function expectApiResponseMatchesStoredReport(
  responseBody: unknown,
  stored: DocumentData,
): void {
  const expected = Object.fromEntries(
    REPORT_API_FIRESTORE_ALIGNMENT_FIELDS.map((field) => [
      field,
      stored[field],
    ]),
  );

  expect(responseBody).toEqual(expect.objectContaining(expected));
}

interface ExpectListedReportsOfTypeOptions {
  traineeId: string;
  type: ReportType;
  periodKeys: readonly string[];
}

/**
 * 一覧 API が指定 type の報告のみを返すことを検証する（I-R03 / I-R04）。
 */
export function expectListedReportsOfType(
  responseBody: unknown,
  expected: ExpectListedReportsOfTypeOptions,
): void {
  expect(Array.isArray(responseBody)).toBe(true);

  const reports = responseBody as Array<{
    traineeId: string;
    type: string;
    periodKey: string;
  }>;

  expect(reports).toHaveLength(expected.periodKeys.length);
  expect(
    reports.every((report) => report.traineeId === expected.traineeId),
  ).toBe(true);
  expect(reports.every((report) => report.type === expected.type)).toBe(true);
  expect(reports.map((report) => report.periodKey).sort()).toEqual(
    [...expected.periodKeys].sort(),
  );
}

interface SeedMixedReportsOptions {
  dailyDates: readonly string[];
  weekKeys: readonly string[];
  dailyBody: unknown;
  weeklyBody: unknown;
}

/** 一覧フィルタ検証用に日次・週次を混在投入する（I-R03 / I-R04）。 */
export async function seedMixedDailyAndWeeklyReports(
  reportRepository: ReportRepository,
  options: SeedMixedReportsOptions,
): Promise<void> {
  for (const date of options.dailyDates) {
    const response = await putDailyReport(
      date,
      options.dailyBody,
      reportRepository,
    );
    expect(response.statusCode).toBe(200);
  }

  for (const weekKey of options.weekKeys) {
    const response = await putWeeklyReport(
      weekKey,
      options.weeklyBody,
      reportRepository,
    );
    expect(response.statusCode).toBe(200);
  }
}

/** トレーナーとして type フィルタ付き一覧を取得し、結果を検証する。 */
export async function expectTrainerReportsFilteredByType(
  reportRepository: ReportRepository,
  expected: ExpectListedReportsOfTypeOptions,
): Promise<void> {
  const response = await getReports(
    {
      traineeId: expected.traineeId,
      type: expected.type,
    },
    reportRepository,
    TRAINER_HEADERS,
  );

  expect(response.statusCode).toBe(200);
  expectListedReportsOfType(response.body, expected);
}

interface ExpectForbiddenOrEmptyReportListOptions {
  deniedTraineeId: string;
  deniedPeriodKey: string;
}

/**
 * 担当外一覧が 403 または空配列で拒否されることを検証する（I-R05）。
 */
export function expectForbiddenOrEmptyReportList(
  response: { statusCode: number; body: unknown },
  expected: ExpectForbiddenOrEmptyReportListOptions,
): void {
  const isForbidden = response.statusCode === 403;
  const isEmptyList =
    response.statusCode === 200 &&
    Array.isArray(response.body) &&
    response.body.length === 0;

  expect(isForbidden || isEmptyList).toBe(true);

  if (isForbidden) {
    expect(response.body).toEqual({
      error: 'Forbidden',
    });
    return;
  }

  expect(response.body).not.toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        traineeId: expected.deniedTraineeId,
        periodKey: expected.deniedPeriodKey,
      }),
    ]),
  );
}
