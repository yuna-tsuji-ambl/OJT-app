import { screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  GOAL_CREATE_SUCCESS_MESSAGE,
  GOAL_DELETE_SUCCESS_MESSAGE,
  GOAL_GANTT_PATH,
  GOAL_INVALID_DATE_RANGE_MESSAGE,
  GOAL_MANAGE_PATH,
  GOAL_UPDATE_SUCCESS_MESSAGE,
} from '../domain/goalForm';
import {
  GANTT_PIXELS_PER_DAY,
  U_G27_SAMPLE_GOALS,
  U_G33_TRAINEE_CREATED_GOAL,
  U_G36_DRAG_GOAL,
  U_G37_RESIZE_GOAL,
  U_G38_SAME_DAY_GOAL,
  U_G39_INVALID_RANGE_GOAL,
  clearAuthSession,
  clickGoalDeleteButton,
  clickGoalEditButton,
  dragGanttBar,
  dragGanttHandle,
  expectGanttBarProgress,
  expectGanttBarsVisible,
  expectGoalDeleteButtonAbsent,
  expectGoalFormValidationError,
  expectGoalGanttPageVisible,
  expectGoalManagePageVisible,
  expectTraineeHeaderGoalNav,
  expectTrainerHeaderGoalNav,
  fillGoalForm,
  navigateFromHeaderToGoals,
  navigateTrainerFromHeaderToGoals,
  renderTraineeGoalNavigation,
  renderTrainerGoalNavigation,
  submitGoalCreateForm,
  submitGoalEditForm,
  waitForGoalSuccessMessage,
} from './goalUiTestHelpers';

const { fetchGoalsMock, createGoalMock, updateGoalMock, deleteGoalMock } =
  vi.hoisted(() => ({
    fetchGoalsMock: vi.fn(),
    createGoalMock: vi.fn(),
    updateGoalMock: vi.fn(),
    deleteGoalMock: vi.fn(),
  }));

vi.mock('../api/statusApi', () => ({
  fetchTrainerStatus: vi.fn().mockResolvedValue({ status: 'available' }),
}));

vi.mock('../hooks/useTraineeHomeMessaging', () => ({
  useTraineeHomeMessaging: () => ({
    messages: [],
    threadMessages: [],
    visibleThreads: [],
    threadListPage: 1,
    threadListTotalPages: 1,
    goToNextThreadListPage: vi.fn(),
    inlineDetail: {
      inlineDetailThreadId: null,
      inlineDetailState: 'closed',
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
  }),
}));

vi.mock('../hooks/useTrainerDashboard', () => ({
  useTrainerDashboard: () => ({
    alerts: [],
    pendingQuests: [],
    progressQuests: [],
    approveQuestAndReload: vi.fn(),
  }),
}));

vi.mock('../api/goalApi', () => ({
  fetchGoals: fetchGoalsMock,
  createGoal: createGoalMock,
  updateGoal: updateGoalMock,
  deleteGoal: deleteGoalMock,
}));

describe('目標 UI', () => {
  beforeEach(() => {
    clearAuthSession();
    fetchGoalsMock.mockReset();
    createGoalMock.mockReset();
    updateGoalMock.mockReset();
    deleteGoalMock.mockReset();
    fetchGoalsMock.mockResolvedValue([]);
    createGoalMock.mockImplementation(async (input) => ({
      id: 'goal-new',
      traineeId: 'trainee-1',
      createdBy: 'trainer-1',
      ...input,
      progress: input.progress ?? 0,
      status: input.status ?? 'not_started',
      createdAt: '2026-08-01T00:00:00.000Z',
      updatedAt: '2026-08-01T00:00:00.000Z',
    }));
    updateGoalMock.mockImplementation(async (_id, input, _user) => ({
      id: _id,
      traineeId: 'trainee-1',
      createdBy: 'trainer-1',
      title: input.title ?? 'updated',
      startDate: input.startDate ?? '2026-08-01',
      endDate: input.endDate ?? '2026-08-05',
      progress: input.progress ?? 0,
      status: input.status ?? 'not_started',
      createdAt: '2026-08-01T00:00:00.000Z',
      updatedAt: '2026-08-02T00:00:00.000Z',
    }));
    deleteGoalMock.mockResolvedValue(undefined);
  });

  describe('U-G23 新卒ヘッダーに「目標」がある', () => {
    it('新卒ログイン済み_ヘッダーに目標リンクが表示される', async () => {
      await renderTraineeGoalNavigation();
      expectTraineeHeaderGoalNav();
    });
  });

  describe('U-G24 トレーナーヘッダーに「目標」がある', () => {
    it('トレーナーログイン済み_ヘッダーに目標リンクが表示される', async () => {
      await renderTrainerGoalNavigation();
      expectTrainerHeaderGoalNav();
    });
  });

  describe('U-G25 新卒・ヘッダー「目標」からの遷移', () => {
    it('ヘッダー目標から遷移_goalsでガントが表示される', async () => {
      await navigateFromHeaderToGoals();
      expectGoalGanttPageVisible();
    });
  });

  describe('U-G26 トレーナー・ヘッダー「目標」からの遷移', () => {
    it('ヘッダー目標から遷移_goalsでガントが表示される', async () => {
      await navigateTrainerFromHeaderToGoals();
      expectGoalGanttPageVisible();
    });
  });

  describe('U-G27 ガントに目標バーが表示される', () => {
    it('goals表示中_各目標バーが期間に対応して表示される', async () => {
      fetchGoalsMock.mockResolvedValue(U_G27_SAMPLE_GOALS);
      await renderTraineeGoalNavigation(GOAL_GANTT_PATH);
      await waitFor(() => {
        expectGanttBarsVisible(U_G27_SAMPLE_GOALS);
      });
      expect(screen.getByText('日付（日）')).toBeTruthy();
      expect(screen.getByTitle('2026-08-01').textContent).toBe('8/1');
      expect(screen.getByTitle('2026-08-15').textContent).toBe('8/15');
    });
  });

  describe('U-G28 進捗がガント表示に反映される', () => {
    it('goals表示中_進捗率がバー上に表示される', async () => {
      fetchGoalsMock.mockResolvedValue(U_G27_SAMPLE_GOALS);
      await renderTraineeGoalNavigation(GOAL_GANTT_PATH);
      await waitFor(() => {
        for (const goal of U_G27_SAMPLE_GOALS) {
          expectGanttBarProgress(goal);
        }
      });
    });
  });

  describe('U-G29 管理画面での目標作成 UI（トレーナー）', () => {
    it('トレーナーが目標を作成すると成功フィードバックが出る', async () => {
      await renderTrainerGoalNavigation(GOAL_MANAGE_PATH);
      await fillGoalForm({
        title: '新規目標',
        startDate: '2026-08-01',
        endDate: '2026-08-10',
      });
      await submitGoalCreateForm();
      await waitForGoalSuccessMessage(GOAL_CREATE_SUCCESS_MESSAGE);
      expect(createGoalMock).toHaveBeenCalled();
    });
  });

  describe('U-G30 管理画面での目標編集 UI（トレーナー）', () => {
    it('トレーナーが目標を編集すると成功フィードバックが出る', async () => {
      fetchGoalsMock.mockResolvedValue([U_G27_SAMPLE_GOALS[0]]);
      await renderTrainerGoalNavigation(GOAL_MANAGE_PATH);
      await waitFor(() => {
        expectGoalManagePageVisible();
      });
      await clickGoalEditButton('TypeScript 基礎');
      await fillGoalForm({ title: 'TypeScript 応用' }, '目標編集');
      await submitGoalEditForm();
      await waitForGoalSuccessMessage(GOAL_UPDATE_SUCCESS_MESSAGE);
      expect(updateGoalMock).toHaveBeenCalled();
    });
  });

  describe('U-G31 管理画面での目標削除 UI（トレーナー）', () => {
    it('トレーナーが目標を削除すると一覧から消える', async () => {
      fetchGoalsMock
        .mockResolvedValueOnce([U_G27_SAMPLE_GOALS[0]])
        .mockResolvedValueOnce([]);
      await renderTrainerGoalNavigation(GOAL_MANAGE_PATH);
      await waitFor(() => {
        expectGoalManagePageVisible();
      });
      await clickGoalDeleteButton('TypeScript 基礎');
      await waitForGoalSuccessMessage(GOAL_DELETE_SUCCESS_MESSAGE);
      expect(deleteGoalMock).toHaveBeenCalledWith(
        U_G27_SAMPLE_GOALS[0].id,
        expect.anything(),
      );
    });
  });

  describe('U-G32 新卒の管理画面での作成・変更 UI', () => {
    it('新卒が目標を作成すると成功フィードバックが出る', async () => {
      await renderTraineeGoalNavigation(GOAL_MANAGE_PATH);
      await fillGoalForm({
        title: '新卒作成目標',
        startDate: '2026-09-01',
        endDate: '2026-09-05',
        progress: 40,
        status: 'in_progress',
      });
      await submitGoalCreateForm();
      await waitForGoalSuccessMessage(GOAL_CREATE_SUCCESS_MESSAGE);
      expect(createGoalMock).toHaveBeenCalled();
    });
  });

  describe('U-G33 トレーナーが新卒作成・更新値を画面で確認', () => {
    it('トレーナー画面に新卒作成目標が表示される', async () => {
      fetchGoalsMock.mockResolvedValue([U_G33_TRAINEE_CREATED_GOAL]);
      await renderTrainerGoalNavigation(GOAL_GANTT_PATH);
      await waitFor(() => {
        expectGanttBarsVisible([U_G33_TRAINEE_CREATED_GOAL]);
      });
      fetchGoalsMock.mockResolvedValue([U_G33_TRAINEE_CREATED_GOAL]);
      await renderTrainerGoalNavigation(GOAL_MANAGE_PATH);
      await waitFor(() => {
        expect(
          document.body.textContent?.includes(U_G33_TRAINEE_CREATED_GOAL.title),
        ).toBe(true);
      });
    });
  });

  describe('U-G34 管理画面の不正期間入力', () => {
    it('終了日が開始日より前だとエラーが表示される', async () => {
      await renderTraineeGoalNavigation(GOAL_MANAGE_PATH);
      await fillGoalForm({
        title: '不正期間目標',
        startDate: '2026-08-10',
        endDate: '2026-08-01',
      });
      await submitGoalCreateForm();
      expectGoalFormValidationError(GOAL_INVALID_DATE_RANGE_MESSAGE);
      expect(createGoalMock).not.toHaveBeenCalled();
    });
  });

  describe('U-G35 新卒管理画面に削除操作がない', () => {
    it('新卒の管理画面に削除ボタンが表示されない', async () => {
      fetchGoalsMock.mockResolvedValue([U_G27_SAMPLE_GOALS[0]]);
      await renderTraineeGoalNavigation(GOAL_MANAGE_PATH);
      await waitFor(() => {
        expectGoalManagePageVisible();
      });
      expectGoalDeleteButtonAbsent();
    });
  });

  describe('U-G36 ガントバーの位置移動 UI', () => {
    it('バー本体をドラッグすると期間長を維持して日付が更新される', async () => {
      fetchGoalsMock.mockResolvedValue([U_G36_DRAG_GOAL]);
      updateGoalMock.mockResolvedValue({
        ...U_G36_DRAG_GOAL,
        startDate: '2026-08-03',
        endDate: '2026-08-07',
      });
      await renderTraineeGoalNavigation(GOAL_GANTT_PATH);
      await waitFor(() => {
        expectGanttBarsVisible([U_G36_DRAG_GOAL]);
      });

      const dayDelta = 2;
      await dragGanttBar(U_G36_DRAG_GOAL.id, dayDelta * GANTT_PIXELS_PER_DAY);

      await waitFor(() => {
        expect(updateGoalMock).toHaveBeenCalledWith(
          U_G36_DRAG_GOAL.id,
          {
            startDate: '2026-08-03',
            endDate: '2026-08-07',
          },
          expect.anything(),
        );
      });
    });
  });

  describe('U-G37 ガントバー端の期間変更 UI', () => {
    it('右端をドラッグすると終了日が更新される', async () => {
      fetchGoalsMock.mockResolvedValue([U_G37_RESIZE_GOAL]);
      updateGoalMock.mockResolvedValue({
        ...U_G37_RESIZE_GOAL,
        endDate: '2026-08-12',
      });
      await renderTraineeGoalNavigation(GOAL_GANTT_PATH);
      await waitFor(() => {
        expectGanttBarsVisible([U_G37_RESIZE_GOAL]);
      });

      await dragGanttHandle(
        U_G37_RESIZE_GOAL.id,
        'end',
        2 * GANTT_PIXELS_PER_DAY,
      );

      await waitFor(() => {
        expect(updateGoalMock).toHaveBeenCalledWith(
          U_G37_RESIZE_GOAL.id,
          {
            startDate: '2026-08-01',
            endDate: '2026-08-12',
          },
          expect.anything(),
        );
      });
    });
  });

  describe('U-G38 期間変更で開始日＝終了日', () => {
    it('右端を縮めて同一日目標として保存できる', async () => {
      fetchGoalsMock.mockResolvedValue([U_G38_SAME_DAY_GOAL]);
      updateGoalMock.mockResolvedValue({
        ...U_G38_SAME_DAY_GOAL,
        startDate: '2026-08-01',
        endDate: '2026-08-01',
      });
      await renderTraineeGoalNavigation(GOAL_GANTT_PATH);
      await waitFor(() => {
        expectGanttBarsVisible([U_G38_SAME_DAY_GOAL]);
      });

      await dragGanttHandle(
        U_G38_SAME_DAY_GOAL.id,
        'end',
        -4 * GANTT_PIXELS_PER_DAY,
      );

      await waitFor(() => {
        expect(updateGoalMock).toHaveBeenCalledWith(
          U_G38_SAME_DAY_GOAL.id,
          {
            startDate: '2026-08-01',
            endDate: '2026-08-01',
          },
          expect.anything(),
        );
      });
    });
  });

  describe('U-G39 期間変更で終了日＜開始日になる操作', () => {
    it('左端を右に超えてドラッグしても開始日が終了日を超えない', async () => {
      fetchGoalsMock.mockResolvedValue([U_G39_INVALID_RANGE_GOAL]);
      updateGoalMock.mockResolvedValue({
        ...U_G39_INVALID_RANGE_GOAL,
        startDate: '2026-08-10',
        endDate: '2026-08-10',
      });
      await renderTraineeGoalNavigation(GOAL_GANTT_PATH);
      await waitFor(() => {
        expectGanttBarsVisible([U_G39_INVALID_RANGE_GOAL]);
      });

      await dragGanttHandle(
        U_G39_INVALID_RANGE_GOAL.id,
        'start',
        20 * GANTT_PIXELS_PER_DAY,
      );

      await waitFor(() => {
        expect(updateGoalMock).toHaveBeenCalledWith(
          U_G39_INVALID_RANGE_GOAL.id,
          {
            startDate: '2026-08-10',
            endDate: '2026-08-10',
          },
          expect.anything(),
        );
      });
    });
  });
});
