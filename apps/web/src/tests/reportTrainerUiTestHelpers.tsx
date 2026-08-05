import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
  type RenderResult,
} from '@testing-library/react';
import { expect } from 'vitest';
import { MemoryRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../auth/AuthContext';
import { Layout } from '../components/Layout';
import { TRAINER_DASHBOARD_PATH } from '../domain/appPaths';
import {
  buildReportDetailPath,
  DAILY_REPORT_FORM_FIELDS,
  DAILY_REPORT_PAGE_TITLE,
  DAILY_REPORT_PATH,
  formatReportPeriodKeyLabel,
  REPORT_DETAIL_ROUTE_PATH,
  REPORT_HEADER_NAV_LABEL,
  REPORT_LIST_PAGE_TITLE,
  REPORT_PAGE_PATH,
  REPORT_TYPE_DAILY,
  REPORT_TYPE_WEEKLY,
  WEEKLY_REPORT_FORM_FIELDS,
  WEEKLY_REPORT_PAGE_TITLE,
  WEEKLY_REPORT_PATH,
  type DailyReportResponse,
  type ReportResponse,
  type WeeklyReportResponse,
} from '../domain/reportForm';
import { DashboardPage } from '../pages/DashboardPage';
import { ReportDetailPage } from '../pages/ReportDetailPage';
import { ReportsRoutePage } from '../pages/ReportsRoutePage';
import { clearAuthSession, setTrainerSession } from './reportAuthTestHelpers';

const DASHBOARD_HEADING = 'ダッシュボード';

export {
  buildReportDetailPath,
  clearAuthSession,
  REPORT_LIST_PAGE_TITLE,
  REPORT_PAGE_PATH,
};

/** トレーナー一覧 API レスポンス（未読フラグは確認事項 6 に合わせ任意） */
export type TrainerReportListItem = ReportResponse & {
  isRead?: boolean;
  unread?: boolean;
};

/**
 * U-R35: 担当新卒の報告が複数存在する前提データ。
 * 左右分割後の表示期待順は「日次（最新順）→ 週次（最新順）」。
 */
export const U_R35_ASSIGNED_TRAINEE_REPORTS: readonly TrainerReportListItem[] =
  [
    {
      id: 'report-u-r35-1',
      traineeId: 'trainee-1',
      type: 'daily',
      periodKey: '2026-07-28',
      status: 'submitted',
      isRead: false,
      updatedAt: '2026-07-28T15:00:00.000Z',
      content: {
        doneToday: '報告書一覧 UI の設計を確認した',
        learnedToday: '未読・最新順の表示方針',
        blockers: 'なし',
        planTomorrow: 'ReportCard を実装する',
      },
    } satisfies DailyReportResponse & { isRead: boolean },
    {
      id: 'report-u-r35-2',
      traineeId: 'trainee-1',
      type: 'weekly',
      periodKey: '2026-W30',
      status: 'submitted',
      isRead: false,
      updatedAt: '2026-07-27T12:00:00.000Z',
      content: {
        achievements: '日次報告画面を完成させた',
        nextWeekGoals: 'トレーナー一覧を実装する',
        reflection: 'カード表示の共通化が進んだ',
        questionsForTrainer: '未読の定義を確認したい',
      },
    } satisfies WeeklyReportResponse & { isRead: boolean },
    {
      id: 'report-u-r35-3',
      traineeId: 'trainee-1',
      type: 'daily',
      periodKey: '2026-07-26',
      status: 'submitted',
      isRead: true,
      updatedAt: '2026-07-26T18:00:00.000Z',
      content: {
        doneToday: '過去報告一覧を実装した',
        learnedToday: 'ReportCard の再利用',
        blockers: 'なし',
        planTomorrow: '週次報告の確認',
      },
    } satisfies DailyReportResponse & { isRead: boolean },
  ];

/** トレーナーログイン済みで報告書関連画面ツリーを描画する */
export async function renderTrainerReportNavigation(
  initialPath = TRAINER_DASHBOARD_PATH,
): Promise<RenderResult> {
  setTrainerSession();

  const view = render(
    <AuthProvider>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route element={<Layout />}>
            <Route path={TRAINER_DASHBOARD_PATH} element={<DashboardPage />} />
            <Route
              path={DAILY_REPORT_PATH}
              element={<Navigate to={REPORT_PAGE_PATH} replace />}
            />
            <Route
              path={WEEKLY_REPORT_PATH}
              element={<Navigate to={REPORT_PAGE_PATH} replace />}
            />
            <Route
              path={REPORT_DETAIL_ROUTE_PATH}
              element={<ReportDetailPage />}
            />
            <Route path={REPORT_PAGE_PATH} element={<ReportsRoutePage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  );

  await act(async () => {
    await Promise.resolve();
  });

  return view;
}

/** ヘッダー「報告書」から報告一覧へ遷移する */
export async function navigateFromHeaderToReportList(): Promise<void> {
  await renderTrainerReportNavigation(TRAINER_DASHBOARD_PATH);
  expect(screen.getByRole('heading', { name: DASHBOARD_HEADING })).toBeTruthy();
  fireEvent.click(screen.getByRole('link', { name: REPORT_HEADER_NAV_LABEL }));
  await act(async () => {
    await Promise.resolve();
  });
}

/** U-R42: ダッシュボードに報告書一覧リンクがない */
export function expectDashboardWithoutReportListLink(): void {
  expect(
    screen.queryByRole('link', { name: REPORT_LIST_PAGE_TITLE }),
  ).toBeNull();
}

/** U-R41: トレーナーヘッダーに報告書項目がある */
export function expectTrainerHeaderReportNav(): void {
  expect(
    screen.getByRole('link', { name: REPORT_HEADER_NAV_LABEL }),
  ).toBeTruthy();
}

/** ReportListPage が表示されていることを検証する */
export function expectReportListPageVisible(): void {
  expect(
    screen.getByRole('heading', { name: REPORT_LIST_PAGE_TITLE }),
  ).toBeTruthy();
}

/** U-R38: トレーナーの `/reports` は一覧画面（左日次・右週次） */
export function expectTrainerReportsListPageVisible(): void {
  expectReportListPageVisible();
  expect(
    screen.getByRole('heading', { name: DAILY_REPORT_PAGE_TITLE }),
  ).toBeTruthy();
  expect(
    screen.getByRole('heading', { name: WEEKLY_REPORT_PAGE_TITLE }),
  ).toBeTruthy();
  expect(
    screen.queryByRole('form', { name: DAILY_REPORT_PAGE_TITLE }),
  ).toBeNull();
  expect(
    screen.queryByRole('form', { name: WEEKLY_REPORT_PAGE_TITLE }),
  ).toBeNull();
}

/** 左=日次 / 右=週次の配置順を検証する */
export function expectTrainerReportSplitOrder(): void {
  const dailyHeading = screen.getByRole('heading', {
    name: DAILY_REPORT_PAGE_TITLE,
  });
  const weeklyHeading = screen.getByRole('heading', {
    name: WEEKLY_REPORT_PAGE_TITLE,
  });
  expect(
    dailyHeading.compareDocumentPosition(weeklyHeading) &
      Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy();
}

function expectReportCardContentVisible(
  card: HTMLElement,
  report: TrainerReportListItem,
): void {
  if (report.type === REPORT_TYPE_DAILY) {
    for (const field of DAILY_REPORT_FORM_FIELDS) {
      expect(within(card).getByText(report.content[field.key])).toBeTruthy();
    }
    return;
  }

  for (const field of WEEKLY_REPORT_FORM_FIELDS) {
    expect(within(card).getByText(report.content[field.key])).toBeTruthy();
  }
}

/** U-R35: ReportCard で担当新卒の報告サマリーが一覧表示されることを検証する */
export async function expectTrainerReportCardsVisible(
  reports: readonly TrainerReportListItem[],
): Promise<void> {
  expect(reports.length).toBeGreaterThanOrEqual(2);

  await waitFor(() => {
    for (const report of reports) {
      const card = screen.getByRole('article', { name: report.periodKey });
      expectReportCardContentVisible(card, report);
    }
  });
}

/** U-R35: 左ペイン日次→右ペイン週次の順でカードが表示されることを検証する */
export async function expectTrainerReportListOrder(
  reports: readonly TrainerReportListItem[],
): Promise<void> {
  const dailyKeys = reports
    .filter((report) => report.type === REPORT_TYPE_DAILY)
    .map((report) => report.periodKey);
  const weeklyKeys = reports
    .filter((report) => report.type === REPORT_TYPE_WEEKLY)
    .map((report) => report.periodKey);
  const expectedPeriodKeys = [...dailyKeys, ...weeklyKeys];

  await waitFor(() => {
    const articles = screen.getAllByRole('article');
    expect(
      articles.map((article) => article.getAttribute('aria-label')),
    ).toEqual(expectedPeriodKeys);
  });
  expectTrainerReportSplitOrder();
}

/** U-R36: 提出済み日次報告（一覧から選択して詳細閲覧する前提データ） */
export const U_R36_SUBMITTED_DAILY_REPORT: DailyReportResponse = {
  id: 'report-u-r36-daily',
  traineeId: 'trainee-1',
  type: 'daily',
  periodKey: '2026-07-28',
  status: 'submitted',
  content: {
    doneToday: '報告詳細画面の仕様を確認した',
    learnedToday: '一覧選択と詳細 API の連携',
    blockers: 'なし',
    planTomorrow: '詳細表示を実装する',
  },
  submittedAt: '2026-07-28T12:00:00.000Z',
};

/** 一覧の報告から詳細へ遷移する（カードのリンク選択） */
export async function selectReportFromTrainerList(
  report: Pick<ReportResponse, 'id' | 'periodKey'>,
): Promise<void> {
  await waitFor(() => {
    expect(screen.getByRole('link', { name: report.periodKey })).toBeTruthy();
  });

  const link = screen.getByRole('link', { name: report.periodKey });
  expect(link.getAttribute('href')).toBe(buildReportDetailPath(report.id));
  fireEvent.click(link);

  await act(async () => {
    await Promise.resolve();
  });
}

/** U-R36: 報告詳細で日次 content 全項目が閲覧できることを検証する */
export async function expectTrainerDailyReportDetailVisible(
  report: DailyReportResponse,
): Promise<void> {
  const detail = await screen.findByRole('region', {
    name: report.periodKey,
  });

  expect(
    within(detail).getByRole('heading', {
      name: formatReportPeriodKeyLabel(report.periodKey),
    }),
  ).toBeTruthy();

  for (const field of DAILY_REPORT_FORM_FIELDS) {
    expect(within(detail).getByText(field.label)).toBeTruthy();
    expect(within(detail).getByText(report.content[field.key])).toBeTruthy();
  }
}

/**
 * U-R38: トレーナーが新卒記入フォームを利用できないことを検証する。
 * 廃止ルートは `/reports` へリダイレクトされ、一覧のみ表示される。
 */
export async function expectTrainerBlockedFromTraineeReportForm(
  formTitle: string,
): Promise<void> {
  await waitFor(() => {
    expect(screen.queryByRole('form', { name: formTitle })).toBeNull();
    expectReportListPageVisible();
  });
}
