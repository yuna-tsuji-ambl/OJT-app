import {
  REPORT_CONTENT_FIELD_MAX_LENGTH,
  REPORT_STATUS_SUBMITTED,
} from '../reports/reportConstants.js';
import type {
  DailyReportContent,
  WeeklyReportContent,
} from '../reports/reportTypes.js';
import type { ReportRepository } from '../repositories/reportRepository.js';
import { invokeReportRoute } from './reportRouteTestHelpers.js';

export const TRAINEE_USER_ID = 'trainee-1';
export const TRAINER_USER_ID = 'trainer-1';

export const U_R01_DAILY_DATE = '2026-07-28';

export const U_R01_DAILY_CONTENT: DailyReportContent = {
  doneToday: 'TypeScriptの型定義を実装した',
  learnedToday: 'ユニオン型と交差型の違い',
  blockers: 'エラーメッセージの読み解きに時間がかかった',
  planTomorrow: 'Reactコンポーネントのテストを書く',
};

export const U_R01_PUT_BODY = {
  status: REPORT_STATUS_SUBMITTED,
  content: U_R01_DAILY_CONTENT,
};

export const U_R02_DAILY_DATE = '2026-07-29';

/** U-R02: 下書き保存が拒否されることの検証用に一部項目のみ入力したコンテンツ */
export const U_R02_PARTIAL_CONTENT: DailyReportContent = {
  doneToday: 'ペアプロでコードレビューを受けた',
  learnedToday: '命名規則の重要性',
  blockers: '',
  planTomorrow: '',
};

/** U-R02: 下書き（`status: draft`）は廃止済みのため拒否される想定の入力 */
export const U_R02_PUT_BODY = {
  status: 'draft',
  content: U_R02_PARTIAL_CONTENT,
};

export const U_R03_DAILY_DATE = '2026-07-30';

/** U-R03: 既存の提出済み報告として保存しておく初回コンテンツ */
export const U_R03_SUBMITTED_CONTENT: DailyReportContent = {
  doneToday: '本日の作業を完了した',
  learnedToday: 'テスト駆動開発の進め方',
  blockers: 'なし',
  planTomorrow: '週次報告の準備',
};

export const U_R03_SUBMITTED_PUT_BODY = {
  status: REPORT_STATUS_SUBMITTED,
  content: U_R03_SUBMITTED_CONTENT,
};

/** U-R03: 提出済み報告に対して下書きへの変更を試みる入力（拒否される想定） */
export const U_R03_DRAFT_CONTENT: DailyReportContent = {
  doneToday: '下書きへの変更を試みる作業内容',
  learnedToday: '下書きへの変更を試みる学び',
  blockers: '',
  planTomorrow: '',
};

export const U_R03_DRAFT_PUT_BODY = {
  status: 'draft',
  content: U_R03_DRAFT_CONTENT,
};

export const U_R04_DAILY_DATE = '2026-08-01';

/** U-R04: 提出済み日次報告の初期コンテンツ */
export const U_R04_INITIAL_CONTENT: DailyReportContent = {
  doneToday: 'API エンドポイントの実装を完了した',
  learnedToday: 'Express ルーターのテスト方法',
  blockers: 'なし',
  planTomorrow: '結合テストの追加',
};

export const U_R04_INITIAL_PUT_BODY = {
  status: REPORT_STATUS_SUBMITTED,
  content: U_R04_INITIAL_CONTENT,
};

/** U-R04: learnedToday のみ変更した更新後コンテンツ */
export const U_R04_UPDATED_CONTENT: DailyReportContent = {
  ...U_R04_INITIAL_CONTENT,
  learnedToday: 'Vitest でのルート結合テストの書き方',
};

export const U_R04_UPDATED_PUT_BODY = {
  status: REPORT_STATUS_SUBMITTED,
  content: U_R04_UPDATED_CONTENT,
};

export const U_R05_DAILY_DATE = '2026-08-02';

/** U-R05: 1 日 1 件制約検証用の初回コンテンツ */
export const U_R05_FIRST_CONTENT: DailyReportContent = {
  doneToday: '初回保存時の作業内容',
  learnedToday: '初回保存時の学び',
  blockers: '初回保存時の課題',
  planTomorrow: '初回保存時の予定',
};

export const U_R05_FIRST_PUT_BODY = {
  status: REPORT_STATUS_SUBMITTED,
  content: U_R05_FIRST_CONTENT,
};

/** U-R05: 同一日付への上書き用コンテンツ（全項目を変更） */
export const U_R05_SECOND_CONTENT: DailyReportContent = {
  doneToday: '上書き後の作業内容',
  learnedToday: '上書き後の学び',
  blockers: '上書き後の課題',
  planTomorrow: '上書き後の予定',
};

export const U_R05_SECOND_PUT_BODY = {
  status: REPORT_STATUS_SUBMITTED,
  content: U_R05_SECOND_CONTENT,
};

export const U_R06_WEEK_KEY = '2026-W30';

export const U_R06_WEEKLY_CONTENT: WeeklyReportContent = {
  achievements: '日次・週次報告 API のテストを整備した',
  nextWeekGoals: '週次報告の取得 API を実装する',
  reflection: 'TDD で仕様と実装の乖離を防げた',
  questionsForTrainer: '週次報告のレビュー観点を教えてください',
};

export const U_R06_PUT_BODY = {
  status: REPORT_STATUS_SUBMITTED,
  content: U_R06_WEEKLY_CONTENT,
};

export const U_R07_WEEK_KEY = '2026-W31';

/** U-R07: 提出済み週次報告の初期コンテンツ */
export const U_R07_INITIAL_WEEKLY_CONTENT: WeeklyReportContent = {
  achievements: '週次報告 API の実装を完了した',
  nextWeekGoals: '提出済み週次報告の更新を実装する',
  reflection: '初回提出時の所感',
  questionsForTrainer: '週次報告のフィードバック形式を教えてください',
};

export const U_R07_INITIAL_PUT_BODY = {
  status: REPORT_STATUS_SUBMITTED,
  content: U_R07_INITIAL_WEEKLY_CONTENT,
};

/** U-R07: reflection のみ変更した更新後コンテンツ */
export const U_R07_UPDATED_WEEKLY_CONTENT: WeeklyReportContent = {
  ...U_R07_INITIAL_WEEKLY_CONTENT,
  reflection: '更新後の所感：週次報告の更新フローを理解した',
};

export const U_R07_UPDATED_PUT_BODY = {
  status: REPORT_STATUS_SUBMITTED,
  content: U_R07_UPDATED_WEEKLY_CONTENT,
};

export const U_R08_WEEK_KEY = '2026-W32';

/** U-R08: 1 週 1 件制約検証用の初回コンテンツ */
export const U_R08_FIRST_WEEKLY_CONTENT: WeeklyReportContent = {
  achievements: '初回保存時の週次成果',
  nextWeekGoals: '初回保存時の来週目標',
  reflection: '初回保存時の所感',
  questionsForTrainer: '初回保存時の相談事項',
};

export const U_R08_FIRST_PUT_BODY = {
  status: REPORT_STATUS_SUBMITTED,
  content: U_R08_FIRST_WEEKLY_CONTENT,
};

/** U-R08: 同一週への上書き用コンテンツ（全項目を変更） */
export const U_R08_SECOND_WEEKLY_CONTENT: WeeklyReportContent = {
  achievements: '上書き後の週次成果',
  nextWeekGoals: '上書き後の来週目標',
  reflection: '上書き後の所感',
  questionsForTrainer: '上書き後の相談事項',
};

export const U_R08_SECOND_PUT_BODY = {
  status: REPORT_STATUS_SUBMITTED,
  content: U_R08_SECOND_WEEKLY_CONTENT,
};

export const U_R09_DAILY_DATE = '2026-08-03';

/** U-R09: 提出時に doneToday が空のコンテンツ */
export const U_R09_MISSING_DONE_TODAY_CONTENT: DailyReportContent = {
  doneToday: '',
  learnedToday: '学んだことは入力済み',
  blockers: '特になし',
  planTomorrow: '明日の予定は入力済み',
};

export const U_R09_PUT_BODY = {
  status: REPORT_STATUS_SUBMITTED,
  content: U_R09_MISSING_DONE_TODAY_CONTENT,
};

export const U_R10_WEEK_KEY = '2026-W33';

/** U-R10: 提出時に reflection が空のコンテンツ */
export const U_R10_MISSING_REFLECTION_CONTENT: WeeklyReportContent = {
  achievements: '週次成果は入力済み',
  nextWeekGoals: '来週目標は入力済み',
  reflection: '',
  questionsForTrainer: '相談事項は入力済み',
};

export const U_R10_PUT_BODY = {
  status: REPORT_STATUS_SUBMITTED,
  content: U_R10_MISSING_REFLECTION_CONTENT,
};

export const U_R11_INVALID_DAILY_DATE = '2026-13-40';

/** U-R11: 不正日付 PUT 用（日付バリデーションが主眼のため有効な body を使用） */
export const U_R11_PUT_BODY = {
  status: REPORT_STATUS_SUBMITTED,
  content: U_R01_DAILY_CONTENT,
};

export const U_R12_INVALID_WEEK_KEY = 'invalid-week';

/** U-R12: 不正週キー PUT 用（週キーバリデーションが主眼のため有効な body を使用） */
export const U_R12_PUT_BODY = {
  status: REPORT_STATUS_SUBMITTED,
  content: U_R06_WEEKLY_CONTENT,
};

export const U_R13_DAILY_DATE = U_R01_DAILY_DATE;

/** U-R13: 取得検証用の提出済み日次報告 */
export const U_R13_PUT_BODY = U_R01_PUT_BODY;

export const U_R13_DAILY_CONTENT = U_R01_DAILY_CONTENT;

/** U-R14: 未作成の日次報告取得用日付（仕様書どおり） */
export const U_R14_DAILY_DATE = '2026-07-01';

/** U-R15: 報告一覧 API の traineeId クエリ（仕様書どおり） */
export const U_R15_LIST_TRAINEE_ID = TRAINEE_USER_ID;

/** U-R16: 一覧取得用の担当新卒 ID（仕様書どおり trainee-1） */
export const U_R16_LIST_TRAINEE_ID = TRAINEE_USER_ID;

/** U-R16: 古い日次 → 新しい日次（最新順検証用） */
export const U_R16_DAILY_DATE_OLDER = '2026-08-10';
export const U_R16_DAILY_DATE_NEWER = '2026-08-11';

/** U-R16: 古い週次 → 新しい週次（最新順検証用） */
export const U_R16_WEEK_KEY_OLDER = '2026-W34';
export const U_R16_WEEK_KEY_NEWER = '2026-W35';

export const U_R16_DAILY_PUT_BODY = U_R01_PUT_BODY;
export const U_R16_WEEKLY_PUT_BODY = U_R06_PUT_BODY;

/** U-R17: トレーナー詳細取得用の日次報告日付 */
export const U_R17_DAILY_DATE = '2026-08-12';

export const U_R17_DAILY_CONTENT = U_R01_DAILY_CONTENT;

export const U_R17_PUT_BODY = U_R01_PUT_BODY;

/** U-R18: 新卒による自分の報告詳細取得用日付 */
export const U_R18_DAILY_DATE = '2026-08-13';

export const U_R18_DAILY_CONTENT = U_R01_DAILY_CONTENT;

export const U_R18_PUT_BODY = U_R01_PUT_BODY;

/** U-R19: 他者報告の所有者（仕様書どおり trainee-2） */
export const OTHER_TRAINEE_USER_ID = 'trainee-2';

/** U-R19: trainee-2 の報告作成用日付 */
export const U_R19_OTHER_TRAINEE_DAILY_DATE = '2026-08-14';

export const U_R19_OTHER_TRAINEE_DAILY_CONTENT = U_R01_DAILY_CONTENT;

export const U_R19_OTHER_TRAINEE_PUT_BODY = U_R01_PUT_BODY;

/** U-R20: トレーナーによる日次報告作成拒否用（仕様書どおり） */
export const U_R20_DAILY_DATE = '2026-07-28';

export const U_R20_PUT_BODY = U_R01_PUT_BODY;

/** U-R21: 未認証アクセス用日付（仕様書どおり） */
export const U_R21_DAILY_DATE = '2026-07-28';

/** U-R21: 認証ヘッダーなし */
export const UNAUTHENTICATED_HEADERS: Record<string, string> = {};

/** U-R22: 不正な status 値の PUT 用日付 */
export const U_R22_DAILY_DATE = '2026-08-15';

/** U-R22: status が draft / submitted 以外（仕様書どおり published） */
export const U_R22_INVALID_STATUS_PUT_BODY = {
  status: 'published',
  content: U_R01_DAILY_CONTENT,
};

/**
 * U-R23 / U-R24: テキスト項目の最大文字数。
 * 詳細設計未確定（report-feature.md ※確認事項 2）のため、テスト契約として
 * `reportConstants.REPORT_CONTENT_FIELD_MAX_LENGTH`（2000）を採用する。
 */
export { REPORT_CONTENT_FIELD_MAX_LENGTH };

/** U-R23: 最大長ちょうどの日次報告用日付 */
export const U_R23_DAILY_DATE = '2026-08-16';

const REPORT_CONTENT_FILL_CHAR = 'a';

export function createDailyContentWithFieldLength(
  length: number,
): DailyReportContent {
  const text = REPORT_CONTENT_FILL_CHAR.repeat(length);
  return {
    doneToday: text,
    learnedToday: text,
    blockers: text,
    planTomorrow: text,
  };
}

export function createDailyContentWithFieldOverMax(
  field: keyof DailyReportContent,
): DailyReportContent {
  return {
    ...createDailyContentWithFieldLength(REPORT_CONTENT_FIELD_MAX_LENGTH),
    [field]: REPORT_CONTENT_FILL_CHAR.repeat(
      REPORT_CONTENT_FIELD_MAX_LENGTH + 1,
    ),
  };
}

export const U_R23_DAILY_CONTENT = createDailyContentWithFieldLength(
  REPORT_CONTENT_FIELD_MAX_LENGTH,
);

export const U_R23_PUT_BODY = {
  status: REPORT_STATUS_SUBMITTED,
  content: U_R23_DAILY_CONTENT,
};

/** U-R24: 最大長超過の日次報告用日付 */
export const U_R24_DAILY_DATE = '2026-08-17';

/** U-R24: doneToday のみ最大長 + 1（仕様: いずれかの項目が超過） */
export const U_R24_DAILY_CONTENT =
  createDailyContentWithFieldOverMax('doneToday');

export const U_R24_PUT_BODY = {
  status: REPORT_STATUS_SUBMITTED,
  content: U_R24_DAILY_CONTENT,
};

/** U-R25: 全項目空文字での提出用日付（下書き廃止により提出時は拒否される想定） */
export const U_R25_DAILY_DATE = '2026-08-18';

export const EMPTY_DAILY_CONTENT = createDailyContentWithFieldLength(0);

export const U_R25_EMPTY_DAILY_CONTENT = EMPTY_DAILY_CONTENT;

export const U_R25_PUT_BODY = {
  status: REPORT_STATUS_SUBMITTED,
  content: U_R25_EMPTY_DAILY_CONTENT,
};

/** I-R01: Firestore 永続化往復用の日次日付 */
export const I_R01_DAILY_DATE = '2026-08-19';

export const I_R01_DAILY_CONTENT = U_R01_DAILY_CONTENT;

export const I_R01_PUT_BODY = U_R01_PUT_BODY;

/** I-R02: GET API と Firestore 整合確認用の日次日付 */
export const I_R02_DAILY_DATE = '2026-08-20';

export const I_R02_PUT_BODY = U_R01_PUT_BODY;

/** I-R03: 一覧 type=daily フィルタ用（日次・週次混在） */
export const I_R03_LIST_TRAINEE_ID = TRAINEE_USER_ID;

export const I_R03_DAILY_DATE_A = '2026-08-21';
export const I_R03_DAILY_DATE_B = '2026-08-22';
export const I_R03_WEEK_KEY = '2026-W36';

export const I_R03_DAILY_PUT_BODY = U_R01_PUT_BODY;
export const I_R03_WEEKLY_PUT_BODY = U_R06_PUT_BODY;

/** I-R04: 一覧 type=weekly フィルタ用（日次・週次混在） */
export const I_R04_LIST_TRAINEE_ID = I_R03_LIST_TRAINEE_ID;

export const I_R04_DAILY_DATE = '2026-08-23';
export const I_R04_WEEK_KEY_A = '2026-W37';
export const I_R04_WEEK_KEY_B = '2026-W38';

export const I_R04_DAILY_PUT_BODY = I_R03_DAILY_PUT_BODY;
export const I_R04_WEEKLY_PUT_BODY = I_R03_WEEKLY_PUT_BODY;

/** I-R05: 担当外新卒（trainee-2）の報告一覧取得拒否用 */
export const I_R05_LIST_TRAINEE_ID = OTHER_TRAINEE_USER_ID;

export const I_R05_DAILY_DATE = '2026-08-24';

export const I_R05_PUT_BODY = U_R01_PUT_BODY;

/** I-R06: 本文全体検索用（マッチする語は match 側の doneToday にのみ含む） */
export const I_R06_SEARCH_TERM = 'ユニーク検索語IR06';
export const I_R06_MATCH_DATE = '2026-09-01';
export const I_R06_OTHER_DATE = '2026-09-02';

export const I_R06_MATCH_PUT_BODY = {
  status: REPORT_STATUS_SUBMITTED,
  content: {
    ...U_R01_DAILY_CONTENT,
    doneToday: `作業メモ ${I_R06_SEARCH_TERM} を含む`,
  },
};

export const I_R06_OTHER_PUT_BODY = {
  status: REPORT_STATUS_SUBMITTED,
  content: {
    ...U_R01_DAILY_CONTENT,
    doneToday: '別件の作業のみ記載',
  },
};

/** I-R07: from/to 期間絞り込み */
export const I_R07_FROM = '2026-09-10';
export const I_R07_TO = '2026-09-12';
export const I_R07_IN_RANGE_DATE = '2026-09-11';
export const I_R07_OUT_RANGE_DATE = '2026-09-15';

/** I-R08: 特定日 */
export const I_R08_TARGET_DATE = '2026-07-28';
export const I_R08_OTHER_DATE = '2026-07-29';

/** I-R09 / I-R10 / I-R11: 週次一覧 */
export const I_R09_SEARCH_TERM = '週次ユニーク語IR09';
export const I_R09_WEEK_MATCH = '2026-W36';
export const I_R09_WEEK_OTHER = '2026-W37';
export const I_R09_MATCH_PUT_BODY = {
  status: REPORT_STATUS_SUBMITTED,
  content: {
    ...U_R06_WEEKLY_CONTENT,
    reflection: `所感に ${I_R09_SEARCH_TERM}`,
  },
};
export const I_R09_OTHER_PUT_BODY = {
  status: REPORT_STATUS_SUBMITTED,
  content: {
    ...U_R06_WEEKLY_CONTENT,
    reflection: '別の所感',
  },
};

/** I-R10: 2026-07-22 は ISO 週 2026-W30 に含まれる */
export const I_R10_DATE_IN_WEEK = '2026-07-22';
export const I_R10_WEEK_KEY = '2026-W30';

/** I-R12: 同時指定 */
export const I_R12_FROM = '2026-07-01';
export const I_R12_TO = '2026-07-31';
export const I_R12_DATE = '2026-07-28';

export type ReportAuthHeaders = {
  'x-user-id': string;
  'x-user-role': string;
};

export function createTraineeHeaders(userId: string): ReportAuthHeaders {
  return {
    'x-user-id': userId,
    'x-user-role': 'trainee',
  };
}

export function createTrainerHeaders(userId: string): ReportAuthHeaders {
  return {
    'x-user-id': userId,
    'x-user-role': 'trainer',
  };
}

export const TRAINEE_HEADERS = createTraineeHeaders(TRAINEE_USER_ID);

export const OTHER_TRAINEE_HEADERS = createTraineeHeaders(
  OTHER_TRAINEE_USER_ID,
);

export const TRAINER_HEADERS = createTrainerHeaders(TRAINER_USER_ID);

export async function putDailyReport(
  date: string,
  body: unknown,
  reportRepository: ReportRepository,
  headers: Record<string, string> = TRAINEE_HEADERS,
): Promise<{ statusCode: number; body: unknown }> {
  return invokeReportRoute(reportRepository, {
    method: 'put',
    path: '/reports/daily/:date',
    params: { date },
    body,
    headers,
  });
}

export async function getDailyReport(
  date: string,
  reportRepository: ReportRepository,
  headers: Record<string, string> = TRAINEE_HEADERS,
): Promise<{ statusCode: number; body: unknown }> {
  return invokeReportRoute(reportRepository, {
    method: 'get',
    path: '/reports/daily/:date',
    params: { date },
    headers,
  });
}

export async function putWeeklyReport(
  weekKey: string,
  body: unknown,
  reportRepository: ReportRepository,
  headers: Record<string, string> = TRAINEE_HEADERS,
): Promise<{ statusCode: number; body: unknown }> {
  return invokeReportRoute(reportRepository, {
    method: 'put',
    path: '/reports/weekly/:weekKey',
    params: { weekKey },
    body,
    headers,
  });
}

export async function getReports(
  query: Record<string, string>,
  reportRepository: ReportRepository,
  headers: Record<string, string> = TRAINEE_HEADERS,
): Promise<{ statusCode: number; body: unknown }> {
  return invokeReportRoute(reportRepository, {
    method: 'get',
    path: '/reports',
    query,
    headers,
  });
}

export async function getOwnDailyReports(
  query: Record<string, string>,
  reportRepository: ReportRepository,
  headers: Record<string, string> = TRAINEE_HEADERS,
): Promise<{ statusCode: number; body: unknown }> {
  return invokeReportRoute(reportRepository, {
    method: 'get',
    path: '/reports/daily',
    query,
    headers,
  });
}

export async function getOwnWeeklyReports(
  query: Record<string, string>,
  reportRepository: ReportRepository,
  headers: Record<string, string> = TRAINEE_HEADERS,
): Promise<{ statusCode: number; body: unknown }> {
  return invokeReportRoute(reportRepository, {
    method: 'get',
    path: '/reports/weekly',
    query,
    headers,
  });
}

export async function getReportById(
  reportId: string,
  reportRepository: ReportRepository,
  headers: Record<string, string> = TRAINEE_HEADERS,
): Promise<{ statusCode: number; body: unknown }> {
  return invokeReportRoute(reportRepository, {
    method: 'get',
    path: '/reports/:id',
    params: { id: reportId },
    headers,
  });
}
