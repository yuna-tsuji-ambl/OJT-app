import {
  act,
  fireEvent,
  render,
  screen,
  within,
  type RenderResult,
} from '@testing-library/react';
import { expect, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../auth/AuthContext';
import { Layout } from '../components/Layout';
import { GANTT_PIXELS_PER_DAY } from '../components/GanttChart';
import { TRAINEE_HOME_PATH } from '../domain/appPaths';
import {
  GOAL_CREATE_SUCCESS_MESSAGE,
  GOAL_DELETE_BUTTON_LABEL,
  GOAL_DELETE_SUCCESS_MESSAGE,
  GOAL_GANTT_PAGE_TITLE,
  GOAL_GANTT_PATH,
  GOAL_HEADER_NAV_LABEL,
  GOAL_INVALID_DATE_RANGE_MESSAGE,
  GOAL_MANAGE_PAGE_TITLE,
  GOAL_MANAGE_PATH,
  GOAL_TITLE_REQUIRED_MESSAGE,
  GOAL_UPDATE_SUCCESS_MESSAGE,
  type GoalResponse,
} from '../domain/goalForm';
import { GoalGanttPage } from '../pages/GoalGanttPage';
import { GoalManagePage } from '../pages/GoalManagePage';
import { TraineeHomePage } from '../pages/TraineeHomePage';
import {
  clearAuthSession,
  setTraineeSession,
  setTrainerSession,
} from './reportAuthTestHelpers';

export { clearAuthSession, setTraineeSession, setTrainerSession };

export const U_G27_SAMPLE_GOALS: readonly GoalResponse[] = [
  {
    id: 'goal-u-g27-1',
    traineeId: 'trainee-1',
    createdBy: 'trainer-1',
    title: 'TypeScript 基礎',
    startDate: '2026-08-01',
    endDate: '2026-08-10',
    progress: 30,
    status: 'in_progress',
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
  },
  {
    id: 'goal-u-g27-2',
    traineeId: 'trainee-1',
    createdBy: 'trainee-1',
    title: 'React コンポーネント',
    startDate: '2026-08-05',
    endDate: '2026-08-15',
    progress: 70,
    status: 'in_progress',
    createdAt: '2026-08-05T00:00:00.000Z',
    updatedAt: '2026-08-05T00:00:00.000Z',
  },
];

export const U_G33_TRAINEE_CREATED_GOAL: GoalResponse = {
  id: 'goal-u-g33-1',
  traineeId: 'trainee-1',
  createdBy: 'trainee-1',
  title: '新卒作成目標',
  startDate: '2026-09-01',
  endDate: '2026-09-05',
  progress: 40,
  status: 'in_progress',
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-01T00:00:00.000Z',
};

export const U_G36_DRAG_GOAL: GoalResponse = {
  id: 'goal-u-g36-1',
  traineeId: 'trainee-1',
  createdBy: 'trainer-1',
  title: 'ドラッグ移動テスト',
  startDate: '2026-08-01',
  endDate: '2026-08-05',
  progress: 0,
  status: 'not_started',
  createdAt: '2026-08-01T00:00:00.000Z',
  updatedAt: '2026-08-01T00:00:00.000Z',
};

export const U_G37_RESIZE_GOAL: GoalResponse = {
  id: 'goal-u-g37-1',
  traineeId: 'trainee-1',
  createdBy: 'trainer-1',
  title: '期間変更テスト',
  startDate: '2026-08-01',
  endDate: '2026-08-10',
  progress: 0,
  status: 'not_started',
  createdAt: '2026-08-01T00:00:00.000Z',
  updatedAt: '2026-08-01T00:00:00.000Z',
};

export const U_G38_SAME_DAY_GOAL: GoalResponse = {
  id: 'goal-u-g38-1',
  traineeId: 'trainee-1',
  createdBy: 'trainer-1',
  title: '同一日縮小テスト',
  startDate: '2026-08-01',
  endDate: '2026-08-05',
  progress: 0,
  status: 'not_started',
  createdAt: '2026-08-01T00:00:00.000Z',
  updatedAt: '2026-08-01T00:00:00.000Z',
};

export const U_G39_INVALID_RANGE_GOAL: GoalResponse = {
  id: 'goal-u-g39-1',
  traineeId: 'trainee-1',
  createdBy: 'trainer-1',
  title: '不正期間防止テスト',
  startDate: '2026-08-01',
  endDate: '2026-08-10',
  progress: 0,
  status: 'not_started',
  createdAt: '2026-08-01T00:00:00.000Z',
  updatedAt: '2026-08-01T00:00:00.000Z',
};

function renderGoalRoutes(
  initialPath: string,
  session: () => void,
): RenderResult {
  session();

  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route element={<Layout />}>
            <Route path={TRAINEE_HOME_PATH} element={<TraineeHomePage />} />
            <Route path={GOAL_GANTT_PATH} element={<GoalGanttPage />} />
            <Route path={GOAL_MANAGE_PATH} element={<GoalManagePage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  );
}

export async function renderTraineeGoalNavigation(
  initialPath = TRAINEE_HOME_PATH,
): Promise<RenderResult> {
  const view = renderGoalRoutes(initialPath, setTraineeSession);
  await act(async () => {
    await Promise.resolve();
  });
  return view;
}

export async function renderTrainerGoalNavigation(
  initialPath = GOAL_GANTT_PATH,
): Promise<RenderResult> {
  const view = renderGoalRoutes(initialPath, setTrainerSession);
  await act(async () => {
    await Promise.resolve();
  });
  return view;
}

export function expectTraineeHeaderGoalNav(): void {
  expect(
    screen.getByRole('link', { name: GOAL_HEADER_NAV_LABEL }),
  ).toBeTruthy();
}

export function expectTrainerHeaderGoalNav(): void {
  expect(
    screen.getByRole('link', { name: GOAL_HEADER_NAV_LABEL }),
  ).toBeTruthy();
}

export async function navigateFromHeaderToGoals(): Promise<void> {
  await renderTraineeGoalNavigation(TRAINEE_HOME_PATH);
  fireEvent.click(screen.getByRole('link', { name: GOAL_HEADER_NAV_LABEL }));
  await act(async () => {
    await Promise.resolve();
  });
}

export async function navigateTrainerFromHeaderToGoals(): Promise<void> {
  await renderTrainerGoalNavigation(GOAL_GANTT_PATH);
  fireEvent.click(screen.getByRole('link', { name: GOAL_HEADER_NAV_LABEL }));
  await act(async () => {
    await Promise.resolve();
  });
}

export function expectGoalGanttPageVisible(): void {
  expect(
    screen.getByRole('heading', { name: GOAL_GANTT_PAGE_TITLE }),
  ).toBeTruthy();
  expect(
    screen.getAllByRole('region', { name: GOAL_GANTT_PAGE_TITLE }).length,
  ).toBeGreaterThan(0);
}

export function expectGoalManagePageVisible(): void {
  expect(
    screen.getByRole('heading', { name: GOAL_MANAGE_PAGE_TITLE }),
  ).toBeTruthy();
}

export function expectGanttBarsVisible(goals: readonly GoalResponse[]): void {
  for (const goal of goals) {
    const bar = screen.getByTestId(`gantt-bar-${goal.id}`);
    expect(bar.getAttribute('data-start-date')).toBe(goal.startDate);
    expect(bar.getAttribute('data-end-date')).toBe(goal.endDate);
    expect(within(bar).getByLabelText(`進捗 ${goal.progress}%`)).toBeTruthy();
  }
}

export function expectGanttBarProgress(goal: GoalResponse): void {
  const bar = screen.getByTestId(`gantt-bar-${goal.id}`);
  expect(
    within(bar).getByText(`${goal.title} (${goal.progress}%)`),
  ).toBeTruthy();
}

export async function fillGoalForm(
  values: {
    title?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    progress?: number;
    status?: string;
  },
  formName: '目標作成' | '目標編集' = '目標作成',
): Promise<void> {
  const form = screen.getByRole('form', { name: formName });

  if (values.title !== undefined) {
    fireEvent.change(within(form).getByLabelText('目標名'), {
      target: { value: values.title },
    });
  }
  if (values.description !== undefined) {
    fireEvent.change(within(form).getByLabelText('説明'), {
      target: { value: values.description },
    });
  }
  if (values.startDate !== undefined) {
    fireEvent.change(within(form).getByLabelText('開始日'), {
      target: { value: values.startDate },
    });
  }
  if (values.endDate !== undefined) {
    fireEvent.change(within(form).getByLabelText('終了日'), {
      target: { value: values.endDate },
    });
  }
  if (values.progress !== undefined) {
    fireEvent.change(within(form).getByLabelText('進捗率'), {
      target: { value: String(values.progress) },
    });
  }
  if (values.status !== undefined) {
    fireEvent.change(within(form).getByLabelText('ステータス'), {
      target: { value: values.status },
    });
  }
}

export async function submitGoalCreateForm(): Promise<void> {
  const forms = screen.getAllByRole('form', { name: '目標作成' });
  fireEvent.submit(forms[0]);
  await act(async () => {
    await Promise.resolve();
  });
}

export async function clickGoalEditButton(title: string): Promise<void> {
  const item = screen.getByText(title).closest('.goal-manage-list__item');
  if (!(item instanceof HTMLElement)) {
    throw new Error(`Goal item not found: ${title}`);
  }
  fireEvent.click(within(item).getByRole('button', { name: '編集' }));
}

export async function submitGoalEditForm(): Promise<void> {
  fireEvent.submit(screen.getByRole('form', { name: '目標編集' }));
  await act(async () => {
    await Promise.resolve();
  });
}

export async function clickGoalDeleteButton(title: string): Promise<void> {
  const item = screen.getByText(title).closest('.goal-manage-list__item');
  if (!(item instanceof HTMLElement)) {
    throw new Error(`Goal item not found: ${title}`);
  }
  fireEvent.click(
    within(item).getByRole('button', { name: GOAL_DELETE_BUTTON_LABEL }),
  );
  await act(async () => {
    await Promise.resolve();
  });
}

export function expectGoalDeleteButtonAbsent(): void {
  expect(
    screen.queryByRole('button', { name: GOAL_DELETE_BUTTON_LABEL }),
  ).toBeNull();
}

export function expectGoalFormValidationError(message: string): void {
  expect(screen.getByRole('alert').textContent).toBe(message);
}

async function dispatchGanttPointerDrag(
  target: Element,
  deltaX: number,
): Promise<void> {
  fireEvent.mouseDown(target, {
    clientX: 100,
    button: 0,
    buttons: 1,
  });
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
  fireEvent.mouseMove(document, {
    clientX: 100 + deltaX,
    buttons: 1,
  });
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
  fireEvent.mouseUp(document, {
    clientX: 100 + deltaX,
    button: 0,
    buttons: 0,
  });
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

export async function dragGanttBar(
  goalId: string,
  deltaX: number,
): Promise<void> {
  await dispatchGanttPointerDrag(
    screen.getByTestId(`gantt-bar-${goalId}`),
    deltaX,
  );
}

export async function dragGanttHandle(
  goalId: string,
  handle: 'start' | 'end',
  deltaX: number,
): Promise<void> {
  const testId =
    handle === 'start'
      ? `gantt-handle-start-${goalId}`
      : `gantt-handle-end-${goalId}`;
  await dispatchGanttPointerDrag(screen.getByTestId(testId), deltaX);
}

export function expectGanttBarDates(
  goalId: string,
  startDate: string,
  endDate: string,
): void {
  const bar = screen.getByTestId(`gantt-bar-${goalId}`);
  expect(bar.getAttribute('data-start-date')).toBe(startDate);
  expect(bar.getAttribute('data-end-date')).toBe(endDate);
}

export async function waitForGoalSuccessMessage(
  message: string,
): Promise<void> {
  expect(
    await screen.findByRole('status', {
      name: message,
    }),
  ).toBeTruthy();
}

export {
  GOAL_CREATE_SUCCESS_MESSAGE,
  GOAL_DELETE_SUCCESS_MESSAGE,
  GOAL_INVALID_DATE_RANGE_MESSAGE,
  GOAL_TITLE_REQUIRED_MESSAGE,
  GOAL_UPDATE_SUCCESS_MESSAGE,
  GANTT_PIXELS_PER_DAY,
};

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
