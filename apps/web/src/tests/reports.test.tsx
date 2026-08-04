import { waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DAILY_REPORT_PAGE_TITLE,
  DAILY_REPORT_PATH,
  REPORT_PAGE_PATH,
  WEEKLY_REPORT_PAGE_TITLE,
  WEEKLY_REPORT_PATH,
} from '../domain/reportForm';
import {
  clearAuthSession,
  clickDailyReportDraftSave,
  clickDailyReportSubmit,
  createTraineeHomeMessagingMock,
  expectDailyReportDraftSaveSuccess,
  expectDailyReportFieldLabelsPerSpec,
  expectDailyReportFieldValues,
  expectDailyReportFormHidden,
  expectDailyReportFormVisible,
  expectDailyReportPeriodKeysNotVisible,
  expectDailyReportPeriodKeysVisible,
  expectDailyReportSubmitSuccess,
  expectPastDailyReportsVisible,
  expectPastWeeklyReportsVisible,
  expectReportListFilterConflictError,
  expectTraineeHeaderReportNav,
  expectTraineeReportPageElementOrder,
  expectTraineeReportsInputPageVisible,
  expectWeeklyReportFieldLabelsPerSpec,
  expectWeeklyReportFormHidden,
  expectWeeklyReportFormVisible,
  expectWeeklyReportPeriodKeysVisible,
  fillDailyReportFields,
  fillReportListFilter,
  navigateFromHeaderToReports,
  renderTraineeReportNavigation,
  selectWeeklyReportTypeToggle,
  submitReportListFilter,
  U_R30_DAILY_DATE,
  U_R30_PARTIAL_DAILY_VALUES,
  U_R31_FULL_DAILY_VALUES,
  U_R32_PAST_DAILY_REPORTS,
  U_R33_PAST_WEEKLY_REPORTS,
  U_R45_DAILY_FILTER_REPORTS,
  U_R48_WEEKLY_FILTER_REPORTS,
} from './reportUiTestHelpers';
import {
  expectDashboardWithoutReportListLink,
  expectReportListPageVisible,
  expectTrainerBlockedFromTraineeReportForm,
  expectTrainerDailyReportDetailVisible,
  expectTrainerHeaderReportNav,
  expectTrainerReportCardsVisible,
  expectTrainerReportListOrder,
  expectTrainerReportsListPageVisible,
  navigateFromHeaderToReportList,
  renderTrainerReportNavigation,
  selectReportFromTrainerList,
  U_R35_ASSIGNED_TRAINEE_REPORTS,
  U_R36_SUBMITTED_DAILY_REPORT,
} from './reportTrainerUiTestHelpers';

const {
  fetchDailyReportMock,
  fetchOwnDailyReportsMock,
  fetchOwnWeeklyReportsMock,
  fetchReportByIdMock,
  fetchReportsMock,
  fetchWeeklyReportMock,
  putDailyReportMock,
  putWeeklyReportMock,
} = vi.hoisted(() => ({
  fetchDailyReportMock: vi.fn(),
  fetchOwnDailyReportsMock: vi.fn(),
  fetchOwnWeeklyReportsMock: vi.fn(),
  fetchReportByIdMock: vi.fn(),
  fetchReportsMock: vi.fn(),
  fetchWeeklyReportMock: vi.fn(),
  putDailyReportMock: vi.fn(),
  putWeeklyReportMock: vi.fn(),
}));

vi.mock('../api/statusApi', () => ({
  fetchTrainerStatus: vi.fn().mockResolvedValue({ status: 'available' }),
}));

vi.mock('../hooks/useTraineeHomeMessaging', () => ({
  useTraineeHomeMessaging: () => createTraineeHomeMessagingMock(),
}));

vi.mock('../hooks/useTrainerDashboard', () => ({
  useTrainerDashboard: () => ({
    alerts: [],
    pendingQuests: [],
    progressQuests: [],
    approveQuestAndReload: vi.fn(),
  }),
}));

vi.mock('../api/reportApi', () => ({
  fetchDailyReport: fetchDailyReportMock,
  fetchOwnDailyReports: fetchOwnDailyReportsMock,
  fetchOwnWeeklyReports: fetchOwnWeeklyReportsMock,
  fetchReportById: fetchReportByIdMock,
  fetchReports: fetchReportsMock,
  fetchWeeklyReport: fetchWeeklyReportMock,
  putDailyReport: putDailyReportMock,
  putWeeklyReport: putWeeklyReportMock,
}));

describe('報告書 UI（新卒）', () => {
  beforeEach(() => {
    clearAuthSession();
    fetchDailyReportMock.mockReset();
    fetchOwnDailyReportsMock.mockReset();
    fetchOwnWeeklyReportsMock.mockReset();
    fetchReportsMock.mockReset();
    fetchWeeklyReportMock.mockReset();
    putDailyReportMock.mockReset();
    putWeeklyReportMock.mockReset();
    fetchDailyReportMock.mockResolvedValue(null);
    fetchOwnDailyReportsMock.mockResolvedValue([]);
    fetchOwnWeeklyReportsMock.mockResolvedValue([]);
    fetchReportsMock.mockResolvedValue([]);
    fetchWeeklyReportMock.mockResolvedValue(null);
  });

  describe('U-R26 新卒・ヘッダー「報告書」からの遷移', () => {
    it('ヘッダー報告書から遷移_reportsで日次記入欄が表示される', async () => {
      await navigateFromHeaderToReports();
      expectDailyReportFormVisible();
    });
  });

  describe('U-R27 新卒・報告書ページの週次入力欄', () => {
    it('週次トグル選択_週次記入欄が表示され日次は非表示になる', async () => {
      await renderTraineeReportNavigation(REPORT_PAGE_PATH);
      expectDailyReportFormVisible();
      await selectWeeklyReportTypeToggle();
      expectWeeklyReportFormVisible();
      expectDailyReportFormHidden();
    });
  });

  describe('U-R28 日次記入欄の項目表示', () => {
    it('reports表示中_日次4項目の入力欄が表示される', async () => {
      await renderTraineeReportNavigation(REPORT_PAGE_PATH);
      expectDailyReportFieldLabelsPerSpec();
    });
  });

  describe('U-R29 週次記入欄の項目表示', () => {
    it('週次トグル選択後_週次4項目の入力欄が表示される', async () => {
      await renderTraineeReportNavigation(REPORT_PAGE_PATH);
      await selectWeeklyReportTypeToggle();
      expectWeeklyReportFieldLabelsPerSpec();
    });
  });

  describe('U-R30 日次報告の下書き保存 UI', () => {
    it('一部項目入力して下書き保存_成功フィードバックが表示され再表示で内容が復元される', async () => {
      fetchDailyReportMock.mockResolvedValue(null);
      putDailyReportMock.mockImplementation(async (periodKey: string) => ({
        id: 'report-u-r30',
        traineeId: 'trainee-1',
        type: 'daily',
        periodKey,
        status: 'draft',
        content: U_R30_PARTIAL_DAILY_VALUES,
      }));

      const firstVisit = await renderTraineeReportNavigation(REPORT_PAGE_PATH);
      await fillDailyReportFields(U_R30_PARTIAL_DAILY_VALUES);
      clickDailyReportDraftSave();

      await waitFor(() => {
        expect(putDailyReportMock).toHaveBeenCalledWith(
          expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
          {
            status: 'draft',
            content: U_R30_PARTIAL_DAILY_VALUES,
          },
          expect.objectContaining({ userId: 'trainee-1', role: 'trainee' }),
        );
      });
      await expectDailyReportDraftSaveSuccess();

      const savedPeriodKey = putDailyReportMock.mock.calls[0]?.[0] as string;
      firstVisit.unmount();

      fetchDailyReportMock.mockResolvedValue({
        id: 'report-u-r30',
        traineeId: 'trainee-1',
        type: 'daily',
        periodKey: savedPeriodKey ?? U_R30_DAILY_DATE,
        status: 'draft',
        content: U_R30_PARTIAL_DAILY_VALUES,
      });

      await renderTraineeReportNavigation(REPORT_PAGE_PATH);
      await expectDailyReportFieldValues(U_R30_PARTIAL_DAILY_VALUES);
    });
  });

  describe('U-R31 日次報告の提出 UI', () => {
    it('全項目入力して提出_成功フィードバックが表示されstatusがsubmittedで保存される', async () => {
      putDailyReportMock.mockImplementation(async (periodKey: string) => ({
        id: 'report-u-r31',
        traineeId: 'trainee-1',
        type: 'daily',
        periodKey,
        status: 'submitted',
        content: U_R31_FULL_DAILY_VALUES,
        submittedAt: '2026-07-28T12:00:00.000Z',
      }));

      await renderTraineeReportNavigation(REPORT_PAGE_PATH);
      await fillDailyReportFields(U_R31_FULL_DAILY_VALUES);
      clickDailyReportSubmit();

      await waitFor(() => {
        expect(putDailyReportMock).toHaveBeenCalledWith(
          expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
          {
            status: 'submitted',
            content: U_R31_FULL_DAILY_VALUES,
          },
          expect.objectContaining({ userId: 'trainee-1', role: 'trainee' }),
        );
      });
      await expectDailyReportSubmitSuccess();
    });
  });

  describe('U-R32 新卒・日次報告書の右ペイン一覧', () => {
    it('日次選択時_右ペインに日次報告書一覧が表示される', async () => {
      fetchOwnDailyReportsMock.mockResolvedValue(U_R32_PAST_DAILY_REPORTS);

      await renderTraineeReportNavigation(REPORT_PAGE_PATH);
      expectDailyReportFormVisible();
      expectWeeklyReportFormHidden();

      await waitFor(() => {
        expect(fetchOwnDailyReportsMock).toHaveBeenCalledWith(
          expect.objectContaining({ userId: 'trainee-1', role: 'trainee' }),
          {},
        );
      });
      await expectPastDailyReportsVisible(U_R32_PAST_DAILY_REPORTS);
    });
  });

  describe('U-R33 新卒・週次報告書の右ペイン一覧', () => {
    it('週次トグル選択_右ペインに週次報告書一覧が表示される', async () => {
      fetchOwnWeeklyReportsMock.mockResolvedValue(U_R33_PAST_WEEKLY_REPORTS);

      await renderTraineeReportNavigation(REPORT_PAGE_PATH);
      await selectWeeklyReportTypeToggle();
      expectWeeklyReportFormVisible();
      expectDailyReportFormHidden();

      await waitFor(() => {
        expect(fetchOwnWeeklyReportsMock).toHaveBeenCalledWith(
          expect.objectContaining({ userId: 'trainee-1', role: 'trainee' }),
          {},
        );
      });
      await expectPastWeeklyReportsVisible(U_R33_PAST_WEEKLY_REPORTS);
    });
  });

  describe('U-R37 新卒の `/reports` は入力画面', () => {
    it('reportsにアクセス_日次週次入力欄が表示されトレーナー一覧は表示されない', async () => {
      await renderTraineeReportNavigation(REPORT_PAGE_PATH);
      expectTraineeReportsInputPageVisible();
    });
  });

  describe('U-R39 新卒ヘッダーに報告書項目がある', () => {
    it('ヘッダーに報告書リンクが表示される', async () => {
      await renderTraineeReportNavigation(REPORT_PAGE_PATH);
      expectTraineeHeaderReportNav();
    });
  });

  describe('U-R40 新卒報告書ページの配置順', () => {
    it('reports表示中_トグル左フォーム右一覧の順である', async () => {
      await renderTraineeReportNavigation(REPORT_PAGE_PATH);
      expectTraineeReportPageElementOrder();
    });
  });

  describe('U-R43 廃止ルートへの依存がない', () => {
    it('homeとヘッダーに日次週次の旧導線がない', async () => {
      await renderTraineeReportNavigation(REPORT_PAGE_PATH);
      expectTraineeHeaderReportNav();
    });
  });

  describe('U-R44 廃止ルートのリダイレクト', () => {
    it.each([
      { path: DAILY_REPORT_PATH, label: '日次' },
      { path: WEEKLY_REPORT_PATH, label: '週次' },
    ] as const)(
      '$label旧パス直接アクセス_reportsへリダイレクトされる',
      async ({ path }) => {
        await renderTraineeReportNavigation(path);
        expectTraineeReportsInputPageVisible();
      },
    );
  });

  describe('U-R45 日次一覧の本文全体検索 UI', () => {
    it('本文検索語で絞り込み_一致する報告のみ表示される', async () => {
      fetchOwnDailyReportsMock.mockImplementation(async (_user, query = {}) => {
        if (query.q === 'ユニーク検索語アルファ') {
          return [U_R45_DAILY_FILTER_REPORTS[0]!];
        }
        return U_R45_DAILY_FILTER_REPORTS;
      });

      await renderTraineeReportNavigation('/reports/daily/list');
      await expectPastDailyReportsVisible(U_R45_DAILY_FILTER_REPORTS);

      fillReportListFilter({ q: 'ユニーク検索語アルファ' });
      submitReportListFilter();

      await waitFor(() => {
        expect(fetchOwnDailyReportsMock).toHaveBeenLastCalledWith(
          expect.objectContaining({ userId: 'trainee-1', role: 'trainee' }),
          { q: 'ユニーク検索語アルファ' },
        );
      });
      await expectDailyReportPeriodKeysVisible(['2026-07-28']);
      await expectDailyReportPeriodKeysNotVisible(['2026-07-20']);
    });
  });

  describe('U-R46 日次一覧の期間絞り込み UI（from/to）', () => {
    it('from/to指定_指定期間内の報告のみ表示される', async () => {
      fetchOwnDailyReportsMock.mockImplementation(async (_user, query = {}) => {
        if (query.from === '2026-07-27' && query.to === '2026-07-28') {
          return [U_R45_DAILY_FILTER_REPORTS[0]!];
        }
        return U_R45_DAILY_FILTER_REPORTS;
      });

      await renderTraineeReportNavigation('/reports/daily/list');
      await expectPastDailyReportsVisible(U_R45_DAILY_FILTER_REPORTS);

      fillReportListFilter({ from: '2026-07-27', to: '2026-07-28' });
      submitReportListFilter();

      await waitFor(() => {
        expect(fetchOwnDailyReportsMock).toHaveBeenLastCalledWith(
          expect.objectContaining({ userId: 'trainee-1', role: 'trainee' }),
          { from: '2026-07-27', to: '2026-07-28' },
        );
      });
      await expectDailyReportPeriodKeysVisible(['2026-07-28']);
      await expectDailyReportPeriodKeysNotVisible(['2026-07-20']);
    });
  });

  describe('U-R47 日次一覧の特定日絞り込み UI', () => {
    it('特定日指定_当該日の報告のみ表示される', async () => {
      fetchOwnDailyReportsMock.mockImplementation(async (_user, query = {}) => {
        if (query.date === '2026-07-28') {
          return [U_R45_DAILY_FILTER_REPORTS[0]!];
        }
        return U_R45_DAILY_FILTER_REPORTS;
      });

      await renderTraineeReportNavigation('/reports/daily/list');
      await expectPastDailyReportsVisible(U_R45_DAILY_FILTER_REPORTS);

      fillReportListFilter({ date: '2026-07-28' });
      submitReportListFilter();

      await waitFor(() => {
        expect(fetchOwnDailyReportsMock).toHaveBeenLastCalledWith(
          expect.objectContaining({ userId: 'trainee-1', role: 'trainee' }),
          { date: '2026-07-28' },
        );
      });
      await expectDailyReportPeriodKeysVisible(['2026-07-28']);
      await expectDailyReportPeriodKeysNotVisible(['2026-07-20']);
    });
  });

  describe('U-R48 週次一覧の検索・期間絞り込み UI', () => {
    it('本文検索と週キー指定_条件に一致する報告のみ表示される', async () => {
      fetchOwnWeeklyReportsMock.mockImplementation(
        async (_user, query = {}) => {
          if (query.q === 'ユニーク検索語ベータ' && query.date === '2026-W30') {
            return [U_R48_WEEKLY_FILTER_REPORTS[0]!];
          }
          return U_R48_WEEKLY_FILTER_REPORTS;
        },
      );

      await renderTraineeReportNavigation('/reports/weekly/list');
      await expectPastWeeklyReportsVisible(U_R48_WEEKLY_FILTER_REPORTS);

      fillReportListFilter({ q: 'ユニーク検索語ベータ', date: '2026-W30' });
      submitReportListFilter();

      await waitFor(() => {
        expect(fetchOwnWeeklyReportsMock).toHaveBeenLastCalledWith(
          expect.objectContaining({ userId: 'trainee-1', role: 'trainee' }),
          { q: 'ユニーク検索語ベータ', date: '2026-W30' },
        );
      });
      await expectWeeklyReportPeriodKeysVisible(['2026-W30']);
    });
  });

  describe('U-R49 期間条件同時指定のエラー UI', () => {
    it('from/toとdate同時指定_エラー表示され一覧は更新されない', async () => {
      fetchOwnDailyReportsMock.mockResolvedValue(U_R45_DAILY_FILTER_REPORTS);

      await renderTraineeReportNavigation('/reports/daily/list');
      await expectPastDailyReportsVisible(U_R45_DAILY_FILTER_REPORTS);

      const callCountBefore = fetchOwnDailyReportsMock.mock.calls.length;
      fillReportListFilter({
        from: '2026-07-01',
        to: '2026-07-31',
        date: '2026-07-28',
      });
      submitReportListFilter();

      await expectReportListFilterConflictError();
      expect(fetchOwnDailyReportsMock.mock.calls.length).toBe(callCountBefore);
      await expectPastDailyReportsVisible(U_R45_DAILY_FILTER_REPORTS);
    });
  });
});

describe('報告書 UI（トレーナー）', () => {
  beforeEach(() => {
    clearAuthSession();
    fetchReportsMock.mockReset();
    fetchReportByIdMock.mockReset();
    fetchDailyReportMock.mockReset();
    fetchOwnDailyReportsMock.mockReset();
    fetchOwnWeeklyReportsMock.mockReset();
    fetchReportsMock.mockResolvedValue([]);
    fetchReportByIdMock.mockResolvedValue(null);
    fetchDailyReportMock.mockResolvedValue(null);
    fetchOwnDailyReportsMock.mockResolvedValue([]);
    fetchOwnWeeklyReportsMock.mockResolvedValue([]);
  });

  describe('U-R34 トレーナー・ヘッダー「報告書」からの遷移', () => {
    it('ヘッダー報告書から遷移_担当新卒の報告書一覧が表示される', async () => {
      await navigateFromHeaderToReportList();
      expectReportListPageVisible();
    });
  });

  describe('U-R35 トレーナー・報告一覧の表示', () => {
    it('reports表示中_担当新卒の報告がReportCardで未読・最新順に一覧表示される', async () => {
      fetchReportsMock.mockResolvedValue([...U_R35_ASSIGNED_TRAINEE_REPORTS]);

      await renderTrainerReportNavigation(REPORT_PAGE_PATH);

      await waitFor(() => {
        expect(fetchReportsMock).toHaveBeenCalledWith(
          'trainee-1',
          expect.objectContaining({ userId: 'trainer-1', role: 'trainer' }),
          {},
        );
      });
      expectReportListPageVisible();
      await expectTrainerReportCardsVisible(U_R35_ASSIGNED_TRAINEE_REPORTS);
      await expectTrainerReportListOrder(U_R35_ASSIGNED_TRAINEE_REPORTS);
    });
  });

  describe('U-R36 トレーナー・報告詳細の表示', () => {
    it('一覧から提出済み報告を選択_詳細で日次content全項目が閲覧できる', async () => {
      fetchReportsMock.mockResolvedValue([U_R36_SUBMITTED_DAILY_REPORT]);
      fetchReportByIdMock.mockResolvedValue(U_R36_SUBMITTED_DAILY_REPORT);

      await renderTrainerReportNavigation(REPORT_PAGE_PATH);
      await selectReportFromTrainerList(U_R36_SUBMITTED_DAILY_REPORT);

      await waitFor(() => {
        expect(fetchReportByIdMock).toHaveBeenCalledWith(
          U_R36_SUBMITTED_DAILY_REPORT.id,
          expect.objectContaining({ userId: 'trainer-1', role: 'trainer' }),
        );
      });
      await expectTrainerDailyReportDetailVisible(U_R36_SUBMITTED_DAILY_REPORT);
    });
  });

  describe('U-R38 トレーナーの `/reports` は一覧画面', () => {
    it('reportsにアクセス_担当新卒の報告書一覧が表示され記入フォームは表示されない', async () => {
      await renderTrainerReportNavigation(REPORT_PAGE_PATH);
      expectTrainerReportsListPageVisible();
    });

    it.each([
      {
        path: DAILY_REPORT_PATH,
        formTitle: DAILY_REPORT_PAGE_TITLE,
        label: '日次',
      },
      {
        path: WEEKLY_REPORT_PATH,
        formTitle: WEEKLY_REPORT_PAGE_TITLE,
        label: '週次',
      },
    ] as const)(
      '$label旧パス直接アクセス_記入フォームは表示されない',
      async ({ path, formTitle }) => {
        await renderTrainerReportNavigation(path);
        await expectTrainerBlockedFromTraineeReportForm(formTitle);
      },
    );
  });

  describe('U-R41 トレーナーヘッダーに報告書項目がある', () => {
    it('ヘッダーに報告書リンクが表示される', async () => {
      await renderTrainerReportNavigation(REPORT_PAGE_PATH);
      expectTrainerHeaderReportNav();
    });
  });

  describe('U-R42 ダッシュボードに報告書一覧リンクがない', () => {
    it('dashboard表示中_報告書一覧リンクは表示されない', async () => {
      await renderTrainerReportNavigation('/dashboard');
      expectDashboardWithoutReportListLink();
    });
  });
});
