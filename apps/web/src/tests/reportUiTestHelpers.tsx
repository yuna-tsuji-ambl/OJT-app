import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
  type RenderResult,
} from '@testing-library/react';
import { expect, vi } from 'vitest';
import { MemoryRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../auth/AuthContext';
import { Layout } from '../components/Layout';
import { clearAuthSession, setTraineeSession } from './reportAuthTestHelpers';
import { TRAINEE_HOME_PATH } from '../domain/appPaths';
import {
  DAILY_REPORT_FORM_FIELDS,
  DAILY_REPORT_LIST_PAGE_TITLE,
  DAILY_REPORT_LIST_PATH,
  DAILY_REPORT_PAGE_TITLE,
  DAILY_REPORT_PATH,
  DAILY_REPORT_RESET_TO_CURRENT_BUTTON_LABEL,
  getDailyReportEditingBannerMessage,
  getReportEditButtonAriaLabel,
  getReportFormFieldLabels,
  getWeeklyReportEditingBannerMessage,
  PAST_DAILY_REPORTS_SECTION_LABEL,
  PAST_WEEKLY_REPORTS_SECTION_LABEL,
  REPORT_HEADER_NAV_LABEL,
  REPORT_LIST_FILTER_CLEAR_BUTTON_LABEL,
  REPORT_LIST_FILTER_DEBOUNCE_MS,
  REPORT_LIST_FILTER_PERIOD_MODE_DATE_LABEL,
  REPORT_LIST_FILTER_PERIOD_MODE_RANGE_LABEL,
  REPORT_LIST_FROM_FIELD_ID,
  REPORT_LIST_PAGE_TITLE,
  REPORT_LIST_DATE_FIELD_ID,
  REPORT_LIST_TO_FIELD_ID,
  REPORT_PAGE_PATH,
  REPORT_PERIOD_FILTER_CONFLICT_MESSAGE,
  REPORT_SPLIT_VIEW_ARIA_LABEL,
  REPORT_SUBMIT_BUTTON_LABEL,
  REPORT_SUBMIT_SUCCESS_MESSAGE,
  REPORT_TYPE_TOGGLE_ARIA_LABEL,
  REPORT_TYPE_TOGGLE_DAILY_LABEL,
  REPORT_TYPE_TOGGLE_WEEKLY_LABEL,
  WEEKLY_REPORT_FORM_FIELDS,
  WEEKLY_REPORT_LIST_PAGE_TITLE,
  WEEKLY_REPORT_LIST_PATH,
  WEEKLY_REPORT_PAGE_TITLE,
  WEEKLY_REPORT_PATH,
  WEEKLY_REPORT_RESET_TO_CURRENT_BUTTON_LABEL,
  type DailyReportFormValues,
  type DailyReportResponse,
  type WeeklyReportResponse,
} from '../domain/reportForm';
import { DailyReportListPage } from '../pages/DailyReportListPage';
import { ReportsRoutePage } from '../pages/ReportsRoutePage';
import { TraineeHomePage } from '../pages/TraineeHomePage';
import { WeeklyReportListPage } from '../pages/WeeklyReportListPage';

export {
  PAST_DAILY_REPORTS_SECTION_LABEL,
  PAST_WEEKLY_REPORTS_SECTION_LABEL,
  REPORT_PERIOD_FILTER_CONFLICT_MESSAGE,
  REPORT_SUBMIT_BUTTON_LABEL,
  REPORT_SUBMIT_SUCCESS_MESSAGE,
};

const TRAINEE_HOME_HEADING = 'ホーム';
const TRAINEE_REPORTS_PAGE_HEADING = '報告書';

export { clearAuthSession, setTraineeSession };

export const DAILY_REPORT_FIELD_LABELS = getReportFormFieldLabels(
  DAILY_REPORT_FORM_FIELDS,
);
export const WEEKLY_REPORT_FIELD_LABELS = getReportFormFieldLabels(
  WEEKLY_REPORT_FORM_FIELDS,
);

/** 仕様書 U-R28 の日次表示名（ドメイン定数と一致させる） */
export const U_R28_DAILY_FIELD_LABELS = [
  '本日やったこと',
  '学んだこと',
  '困っていること',
  '明日やること',
] as const;

/** 仕様書 U-R29 の週次表示名（ドメイン定数と一致させる） */
export const U_R29_WEEKLY_FIELD_LABELS = [
  '今週の成果',
  '来週の目標',
  '所感',
  'トレーナーへの相談',
] as const;

/** U-R30: 一覧編集対象の過去日次報告（一部項目を編集して再提出する） */
export const U_R30_DAILY_DATE = '2026-07-28';

export const U_R30_EXISTING_DAILY_VALUES: DailyReportFormValues = {
  doneToday: 'ペアプロでコードレビューを受けた',
  learnedToday: '命名規則の重要性',
  blockers: '特になし',
  planTomorrow: '次の課題に取り組む',
};

export const U_R30_EXISTING_DAILY_REPORT: DailyReportResponse = {
  id: 'report-u-r30',
  traineeId: 'trainee-1',
  type: 'daily',
  periodKey: U_R30_DAILY_DATE,
  status: 'submitted',
  content: U_R30_EXISTING_DAILY_VALUES,
};

export const U_R30_EDITED_DAILY_VALUES: DailyReportFormValues = {
  ...U_R30_EXISTING_DAILY_VALUES,
  planTomorrow: 'ペアプロの振り返りをまとめる',
};

/** U-R31: 全項目入力した日次提出コンテンツ */
export const U_R31_FULL_DAILY_VALUES: DailyReportFormValues = {
  doneToday: 'TypeScriptの型定義を実装した',
  learnedToday: 'ユニオン型と交差型の違い',
  blockers: 'エラーメッセージの読み解きに時間がかかった',
  planTomorrow: 'Reactコンポーネントのテストを書く',
};

/** U-R32: 過去の日次報告が 2 件以上存在する前提データ */
export const U_R32_PAST_DAILY_REPORTS: DailyReportResponse[] = [
  {
    id: 'report-u-r32-1',
    traineeId: 'trainee-1',
    type: 'daily',
    periodKey: '2026-07-28',
    status: 'submitted',
    content: {
      doneToday: 'API 設計をレビューした',
      learnedToday: 'REST の資源設計',
      blockers: 'なし',
      planTomorrow: '実装を進める',
    },
  },
  {
    id: 'report-u-r32-2',
    traineeId: 'trainee-1',
    type: 'daily',
    periodKey: '2026-07-27',
    status: 'submitted',
    content: {
      doneToday: '単体テストを追加した',
      learnedToday: 'Vitest のモック',
      blockers: '非同期テストの書き方',
      planTomorrow: '結合テストを書く',
    },
  },
];

/** U-R33: 過去の週次報告が 2 件以上存在する前提データ */
export const U_R33_PAST_WEEKLY_REPORTS: WeeklyReportResponse[] = [
  {
    id: 'report-u-r33-1',
    traineeId: 'trainee-1',
    type: 'weekly',
    periodKey: '2026-W30',
    status: 'submitted',
    content: {
      achievements: '報告書 API の実装を完了した',
      nextWeekGoals: 'UI テストを拡充する',
      reflection: '型安全な設計の重要性を実感した',
      questionsForTrainer: '週次レビューの観点を教えてほしい',
    },
  },
  {
    id: 'report-u-r33-2',
    traineeId: 'trainee-1',
    type: 'weekly',
    periodKey: '2026-W29',
    status: 'submitted',
    content: {
      achievements: '認証まわりの結合テストを追加した',
      nextWeekGoals: '報告書画面の導線を整える',
      reflection: 'テストファーストで手戻りが減った',
      questionsForTrainer: '週次の粒度はこれでよいか',
    },
  },
];

/** U-R45〜U-R47: 日次一覧フィルタ検証用データ */
export const U_R45_DAILY_FILTER_REPORTS: DailyReportResponse[] = [
  {
    id: 'report-u-r45-1',
    traineeId: 'trainee-1',
    type: 'daily',
    periodKey: '2026-07-28',
    status: 'submitted',
    content: {
      doneToday: 'ユニーク検索語アルファで作業した',
      learnedToday: 'REST',
      blockers: 'なし',
      planTomorrow: '続き',
    },
  },
  {
    id: 'report-u-r45-2',
    traineeId: 'trainee-1',
    type: 'daily',
    periodKey: '2026-07-20',
    status: 'submitted',
    content: {
      doneToday: '別日の作業',
      learnedToday: 'テスト',
      blockers: 'なし',
      planTomorrow: '続き',
    },
  },
];

/** U-R48: 週次一覧フィルタ検証用データ */
export const U_R48_WEEKLY_FILTER_REPORTS: WeeklyReportResponse[] = [
  {
    id: 'report-u-r48-1',
    traineeId: 'trainee-1',
    type: 'weekly',
    periodKey: '2026-W30',
    status: 'submitted',
    content: {
      achievements: 'ユニーク検索語ベータの成果',
      nextWeekGoals: '来週はテストを拡充する',
      reflection: '週次振り返りの内容ベータ',
      questionsForTrainer: '週次レビューについて相談したい',
    },
  },
  {
    id: 'report-u-r48-2',
    traineeId: 'trainee-1',
    type: 'weekly',
    periodKey: '2026-W28',
    status: 'submitted',
    content: {
      achievements: '別週の成果アルファ',
      nextWeekGoals: '来週は設計を進める',
      reflection: '週次振り返りの内容ガンマ',
      questionsForTrainer: '別週の相談事項',
    },
  },
];

/** TraineeHomePage のメッセージ連携を隔離するモック戻り値 */
export function createTraineeHomeMessagingMock() {
  return {
    messages: [],
    threadMessages: [],
    visibleThreads: [],
    threadListPage: 1,
    threadListTotalPages: 1,
    goToNextThreadListPage: vi.fn(),
    inlineDetail: {
      inlineDetailThreadId: null,
      inlineDetailState: 'closed' as const,
      selectedThreadId: null,
    },
    historyError: null,
    selectedTemplateId: '',
    freeTextContent: '',
    threadReplyForm: {
      selectedTemplateId: '',
      freeTextContent: '',
      onSelectTemplate: vi.fn(),
      onFreeTextChange: vi.fn(),
      onSend: vi.fn(),
      onSendStampReply: vi.fn(),
    },
    setSelectedTemplateId: vi.fn(),
    setFreeTextContent: vi.fn(),
    selectThread: vi.fn(),
    sendMessage: vi.fn(),
  };
}

function renderTraineeReportRoutes(initialPath: string): RenderResult {
  setTraineeSession();

  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route element={<Layout />}>
            <Route path={TRAINEE_HOME_PATH} element={<TraineeHomePage />} />
            <Route
              path={DAILY_REPORT_PATH}
              element={<Navigate to={REPORT_PAGE_PATH} replace />}
            />
            <Route
              path={WEEKLY_REPORT_PATH}
              element={<Navigate to={REPORT_PAGE_PATH} replace />}
            />
            <Route
              path={DAILY_REPORT_LIST_PATH}
              element={<DailyReportListPage />}
            />
            <Route
              path={WEEKLY_REPORT_LIST_PATH}
              element={<WeeklyReportListPage />}
            />
            <Route path={REPORT_PAGE_PATH} element={<ReportsRoutePage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  );
}

/** 新卒ログイン済みで報告書関連画面ツリーを描画する */
export async function renderTraineeReportNavigation(
  initialPath = TRAINEE_HOME_PATH,
): Promise<RenderResult> {
  const view = renderTraineeReportRoutes(initialPath);

  await act(async () => {
    await Promise.resolve();
  });

  return view;
}

/** ヘッダー「報告書」から `/reports` へ遷移する */
export async function navigateFromHeaderToReports(): Promise<void> {
  await renderTraineeReportNavigation(TRAINEE_HOME_PATH);
  expect(
    screen.getByRole('heading', { name: TRAINEE_HOME_HEADING }),
  ).toBeTruthy();
  fireEvent.click(screen.getByRole('link', { name: REPORT_HEADER_NAV_LABEL }));
  await act(async () => {
    await Promise.resolve();
  });
}

export function expectFieldLabelsVisible(labels: readonly string[]): void {
  for (const label of labels) {
    expect(screen.getByLabelText(label)).toBeTruthy();
  }
}

export function expectDailyReportFormVisible(): void {
  expect(
    screen.getByRole('heading', { name: DAILY_REPORT_PAGE_TITLE }),
  ).toBeTruthy();
  expect(
    screen.getByRole('form', { name: DAILY_REPORT_PAGE_TITLE }),
  ).toBeTruthy();
  expectFieldLabelsVisible(DAILY_REPORT_FIELD_LABELS);
}

export function expectWeeklyReportFormVisible(): void {
  expect(
    screen.getByRole('heading', { name: WEEKLY_REPORT_PAGE_TITLE }),
  ).toBeTruthy();
  expect(
    screen.getByRole('form', { name: WEEKLY_REPORT_PAGE_TITLE }),
  ).toBeTruthy();
  expectFieldLabelsVisible(WEEKLY_REPORT_FIELD_LABELS);
}

export function expectDailyReportFormHidden(): void {
  expect(
    screen.queryByRole('form', { name: DAILY_REPORT_PAGE_TITLE }),
  ).toBeNull();
}

export function expectWeeklyReportFormHidden(): void {
  expect(
    screen.queryByRole('form', { name: WEEKLY_REPORT_PAGE_TITLE }),
  ).toBeNull();
}

/** 日次／週次トグルを選択する */
export async function selectReportTypeToggle(
  label:
    | typeof REPORT_TYPE_TOGGLE_DAILY_LABEL
    | typeof REPORT_TYPE_TOGGLE_WEEKLY_LABEL,
): Promise<void> {
  fireEvent.click(screen.getByRole('button', { name: label }));
  await act(async () => {
    await Promise.resolve();
  });
}

export async function selectWeeklyReportTypeToggle(): Promise<void> {
  await selectReportTypeToggle(REPORT_TYPE_TOGGLE_WEEKLY_LABEL);
}

/** U-R37: 新卒の `/reports` は入力画面であることを検証する */
export function expectTraineeReportsInputPageVisible(): void {
  expect(
    screen.getByRole('heading', { name: TRAINEE_REPORTS_PAGE_HEADING }),
  ).toBeTruthy();
  expect(
    screen.getByRole('group', { name: REPORT_TYPE_TOGGLE_ARIA_LABEL }),
  ).toBeTruthy();
  expectDailyReportFormVisible();
  expect(
    screen.queryByRole('heading', { name: REPORT_LIST_PAGE_TITLE }),
  ).toBeNull();
}

/** U-R40: トグル → 左フォーム（日次） → 右一覧（日次）の順 */
export function expectTraineeReportPageElementOrder(): void {
  const toggle = screen.getByRole('group', {
    name: REPORT_TYPE_TOGGLE_ARIA_LABEL,
  });
  const dailyHeading = screen.getByRole('heading', {
    name: DAILY_REPORT_PAGE_TITLE,
  });
  const pastDailyList =
    screen.queryByRole('region', { name: PAST_DAILY_REPORTS_SECTION_LABEL }) ??
    screen.getByText(`${PAST_DAILY_REPORTS_SECTION_LABEL}はありません`);

  const order = [toggle, dailyHeading, pastDailyList];
  for (let index = 0; index < order.length - 1; index += 1) {
    expect(
      order[index]!.compareDocumentPosition(order[index + 1]!) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  }
  expect(
    screen.getByRole('group', { name: REPORT_SPLIT_VIEW_ARIA_LABEL }),
  ).toBeTruthy();
}

/** U-R39 / U-R43: ヘッダーに報告書があり、廃止ルートへの導線がない */
export function expectTraineeHeaderReportNav(): void {
  expect(
    screen.getByRole('link', { name: REPORT_HEADER_NAV_LABEL }),
  ).toBeTruthy();
  expect(
    screen.queryByRole('link', { name: DAILY_REPORT_PAGE_TITLE }),
  ).toBeNull();
  expect(
    screen.queryByRole('link', { name: WEEKLY_REPORT_PAGE_TITLE }),
  ).toBeNull();
}

/** U-R28: 日次4項目の表示名が仕様どおり画面に出ていることを検証する */
export function expectDailyReportFieldLabelsPerSpec(): void {
  expect(DAILY_REPORT_FIELD_LABELS).toEqual([...U_R28_DAILY_FIELD_LABELS]);
  expectFieldLabelsVisible(U_R28_DAILY_FIELD_LABELS);
}

/** U-R29: 週次4項目の表示名が仕様どおり画面に出ていることを検証する */
export function expectWeeklyReportFieldLabelsPerSpec(): void {
  expect(WEEKLY_REPORT_FIELD_LABELS).toEqual([...U_R29_WEEKLY_FIELD_LABELS]);
  expectFieldLabelsVisible(U_R29_WEEKLY_FIELD_LABELS);
}

function getTextareaByLabel(label: string): HTMLTextAreaElement {
  return screen.getByLabelText(label) as HTMLTextAreaElement;
}

/** 日次報告フォームへ値を入力する（空文字はスキップ） */
export async function fillDailyReportFields(
  values: Partial<DailyReportFormValues>,
): Promise<void> {
  await waitFor(() => {
    expect(getTextareaByLabel(DAILY_REPORT_FORM_FIELDS[0].label).disabled).toBe(
      false,
    );
  });

  for (const field of DAILY_REPORT_FORM_FIELDS) {
    const value = values[field.key];
    if (value === undefined || value === '') {
      continue;
    }
    fireEvent.change(getTextareaByLabel(field.label), {
      target: { value },
    });
  }
}

function clickButtonByName(name: string): void {
  fireEvent.click(screen.getByRole('button', { name }));
}

async function expectStatusFeedback(message: string): Promise<void> {
  expect(
    await screen.findByRole('status', {
      name: message,
    }),
  ).toBeTruthy();
}

/** 一覧カードの「編集」を押し、指定 periodKey の報告を左フォームへ読み込む */
export function clickReportEdit(periodKey: string): void {
  clickButtonByName(getReportEditButtonAriaLabel(periodKey));
}

export function expectDailyReportEditingBannerVisible(periodKey: string): void {
  expect(
    screen.getByText(getDailyReportEditingBannerMessage(periodKey)),
  ).toBeTruthy();
}

export function expectWeeklyReportEditingBannerVisible(
  periodKey: string,
): void {
  expect(
    screen.getByText(getWeeklyReportEditingBannerMessage(periodKey)),
  ).toBeTruthy();
}

export function expectDailyReportEditingBannerHidden(periodKey: string): void {
  expect(
    screen.queryByText(getDailyReportEditingBannerMessage(periodKey)),
  ).toBeNull();
}

export function expectWeeklyReportEditingBannerHidden(periodKey: string): void {
  expect(
    screen.queryByText(getWeeklyReportEditingBannerMessage(periodKey)),
  ).toBeNull();
}

export function clickDailyReportResetToCurrent(): void {
  clickButtonByName(DAILY_REPORT_RESET_TO_CURRENT_BUTTON_LABEL);
}

export function clickWeeklyReportResetToCurrent(): void {
  clickButtonByName(WEEKLY_REPORT_RESET_TO_CURRENT_BUTTON_LABEL);
}

export function clickDailyReportSubmit(): void {
  const dailyHeading = screen.getByRole('heading', {
    name: DAILY_REPORT_PAGE_TITLE,
  });
  const dailySection = dailyHeading.closest('section');
  if (!dailySection) {
    throw new Error('日次報告セクションが見つかりません');
  }
  fireEvent.click(
    within(dailySection).getByRole('button', {
      name: REPORT_SUBMIT_BUTTON_LABEL,
    }),
  );
}

export async function expectDailyReportSubmitSuccess(): Promise<void> {
  await expectStatusFeedback(REPORT_SUBMIT_SUCCESS_MESSAGE);
}

export async function expectDailyReportFieldValues(
  values: DailyReportFormValues,
): Promise<void> {
  await waitFor(() => {
    for (const field of DAILY_REPORT_FORM_FIELDS) {
      expect(getTextareaByLabel(field.label).value).toBe(values[field.key]);
    }
  });
}

async function expectPastReportsVisible<TKey extends string>(
  sectionLabel: string,
  reports: readonly {
    periodKey: string;
    content: Record<TKey, string>;
  }[],
  fields: readonly { readonly key: TKey; readonly label: string }[],
): Promise<void> {
  const section = await screen.findByRole('region', {
    name: sectionLabel,
  });

  expect(reports.length).toBeGreaterThanOrEqual(1);

  for (const report of reports) {
    const card = within(section).getByRole('article', {
      name: report.periodKey,
    });

    for (const field of fields) {
      expect(within(card).getByText(report.content[field.key])).toBeTruthy();
    }
  }
}

export async function expectPastDailyReportsVisible(
  reports: readonly DailyReportResponse[],
): Promise<void> {
  await expectPastReportsVisible(
    PAST_DAILY_REPORTS_SECTION_LABEL,
    reports,
    DAILY_REPORT_FORM_FIELDS,
  );
}

export async function expectPastWeeklyReportsVisible(
  reports: readonly WeeklyReportResponse[],
): Promise<void> {
  await expectPastReportsVisible(
    PAST_WEEKLY_REPORTS_SECTION_LABEL,
    reports,
    WEEKLY_REPORT_FORM_FIELDS,
  );
}

export function expectDailyReportListPageVisible(): void {
  expect(
    screen.getByRole('heading', { name: DAILY_REPORT_LIST_PAGE_TITLE }),
  ).toBeTruthy();
}

export function expectWeeklyReportListPageVisible(): void {
  expect(
    screen.getByRole('heading', { name: WEEKLY_REPORT_LIST_PAGE_TITLE }),
  ).toBeTruthy();
}

/** 期間の指定方法ラジオを「期間で指定（from/to）」に切り替える */
export function selectReportListFilterRangeMode(): void {
  fireEvent.click(
    screen.getByRole('radio', {
      name: REPORT_LIST_FILTER_PERIOD_MODE_RANGE_LABEL,
    }),
  );
}

/** 期間の指定方法ラジオを「特定日で指定」に切り替える */
export function selectReportListFilterDateMode(): void {
  fireEvent.click(
    screen.getByRole('radio', {
      name: REPORT_LIST_FILTER_PERIOD_MODE_DATE_LABEL,
    }),
  );
}

/**
 * 報告書一覧の絞り込みフォームに値を入力する（U-R45〜U-R49）。
 * from/to と date は排他ラジオで切り替わるため、指定された条件に応じて
 * 対応するモードへ切り替えたうえで、非表示状態の入力欄は操作しない。
 */
export function fillReportListFilter(values: {
  q?: string;
  from?: string;
  to?: string;
  date?: string;
}): void {
  if (values.q !== undefined) {
    fireEvent.change(screen.getByLabelText('本文検索'), {
      target: { value: values.q },
    });
  }
  if (values.date !== undefined) {
    selectReportListFilterDateMode();
    fireEvent.change(document.getElementById(REPORT_LIST_DATE_FIELD_ID)!, {
      target: { value: values.date },
    });
    return;
  }
  if (values.from !== undefined || values.to !== undefined) {
    selectReportListFilterRangeMode();
  }
  if (values.from !== undefined) {
    fireEvent.change(document.getElementById(REPORT_LIST_FROM_FIELD_ID)!, {
      target: { value: values.from },
    });
  }
  if (values.to !== undefined) {
    fireEvent.change(document.getElementById(REPORT_LIST_TO_FIELD_ID)!, {
      target: { value: values.to },
    });
  }
}

/** 絞り込み入力欄の変更後、デバウンス（300ms）による自動適用を待つ */
export async function waitForReportListFilterDebounce(): Promise<void> {
  await act(async () => {
    await new Promise((resolve) =>
      setTimeout(resolve, REPORT_LIST_FILTER_DEBOUNCE_MS + 50),
    );
  });
}

export function clickReportListFilterClear(): void {
  fireEvent.click(
    screen.getByRole('button', { name: REPORT_LIST_FILTER_CLEAR_BUTTON_LABEL }),
  );
}

export async function expectReportListFilterConflictError(): Promise<void> {
  expect(
    await screen.findByText(REPORT_PERIOD_FILTER_CONFLICT_MESSAGE),
  ).toBeTruthy();
}

export async function expectDailyReportPeriodKeysVisible(
  periodKeys: readonly string[],
): Promise<void> {
  await waitFor(() => {
    const section = screen.getByRole('region', {
      name: PAST_DAILY_REPORTS_SECTION_LABEL,
    });
    const visibleKeys = within(section)
      .getAllByRole('article')
      .map((article) => article.getAttribute('aria-label'));
    expect(visibleKeys).toEqual(periodKeys);
  });
}

export async function expectDailyReportPeriodKeysNotVisible(
  periodKeys: readonly string[],
): Promise<void> {
  await waitFor(() => {
    for (const periodKey of periodKeys) {
      expect(screen.queryByRole('article', { name: periodKey })).toBeNull();
    }
  });
}

export async function expectWeeklyReportPeriodKeysVisible(
  periodKeys: readonly string[],
): Promise<void> {
  await waitFor(() => {
    const section = screen.getByRole('region', {
      name: PAST_WEEKLY_REPORTS_SECTION_LABEL,
    });
    const visibleKeys = within(section)
      .getAllByRole('article')
      .map((article) => article.getAttribute('aria-label'));
    expect(visibleKeys).toEqual(periodKeys);
  });
}
