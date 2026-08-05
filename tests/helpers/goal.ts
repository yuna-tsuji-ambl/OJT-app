import {
  expect,
  type APIRequestContext,
  type Locator,
  type Page,
} from '@playwright/test';

export const GOAL_GANTT_PATH = '/goals';
export const GOAL_MANAGE_PATH = '/goals/manage';
export const GOAL_HEADER_NAV_LABEL = '目標';
export const GOAL_GANTT_PAGE_TITLE = '目標ガントチャート';
export const GOAL_MANAGE_PAGE_TITLE = '目標管理';
export const GOAL_MANAGE_LINK_LABEL = '目標管理へ';
export const GOAL_GANTT_LINK_LABEL = 'ガントチャートへ';
export const GOAL_CREATE_SUBMIT_LABEL = '作成';
export const GOAL_UPDATE_SUBMIT_LABEL = '保存';
export const GOAL_DELETE_BUTTON_LABEL = '削除';
export const GOAL_EDIT_BUTTON_LABEL = '編集';
export const GOAL_CREATE_SUCCESS_MESSAGE = '目標を作成しました';
export const GOAL_UPDATE_SUCCESS_MESSAGE = '目標を更新しました';
export const GOAL_DELETE_SUCCESS_MESSAGE = '目標を削除しました';
export const GOAL_TITLE_REQUIRED_MESSAGE = '目標名を入力してください';
export const GOAL_TITLE_FIELD_LABEL = '目標名';
export const GOAL_START_DATE_FIELD_LABEL = '開始日';
export const GOAL_END_DATE_FIELD_LABEL = '終了日';
export const GOAL_PROGRESS_FIELD_LABEL = '進捗率';
export const GOAL_STATUS_FIELD_LABEL = 'ステータス';
export const MAIN_NAV_ARIA_LABEL = 'メインナビゲーション';

const TRAINEE_API_HEADERS = {
  'Content-Type': 'application/json',
  'X-User-Id': 'trainee-1',
  'X-User-Role': 'trainee',
} as const;

const TRAINER_API_HEADERS = {
  'Content-Type': 'application/json',
  'X-User-Id': 'trainer-1',
  'X-User-Role': 'trainer',
} as const;

export interface GoalFormValues {
  readonly title: string;
  readonly description?: string;
  readonly startDate: string;
  readonly endDate: string;
  readonly progress?: number;
  readonly status?: string;
}

export async function navigateToGoalsFromHeader(page: Page): Promise<void> {
  await page
    .getByRole('navigation', { name: MAIN_NAV_ARIA_LABEL })
    .getByRole('link', { name: GOAL_HEADER_NAV_LABEL })
    .click();
  await expect(
    page.getByRole('heading', { name: GOAL_GANTT_PAGE_TITLE }),
  ).toBeVisible();
}

export async function openGoalGanttPage(page: Page): Promise<void> {
  await page.goto(GOAL_GANTT_PATH);
  await expect(
    page.getByRole('heading', { name: GOAL_GANTT_PAGE_TITLE }),
  ).toBeVisible();
}

export async function openGoalManagePage(page: Page): Promise<void> {
  await page.goto(GOAL_MANAGE_PATH);
  await expect(
    page.getByRole('heading', { name: GOAL_MANAGE_PAGE_TITLE }),
  ).toBeVisible();
}

export async function fillGoalForm(
  page: Page,
  values: Partial<GoalFormValues>,
  formName: '目標作成' | '目標編集' = '目標作成',
): Promise<void> {
  const form = page.getByRole('form', { name: formName });

  if (values.title !== undefined) {
    await form.getByLabel(GOAL_TITLE_FIELD_LABEL).fill(values.title);
  }
  if (values.description !== undefined) {
    await form.getByLabel('説明').fill(values.description);
  }
  if (values.startDate !== undefined) {
    await form.getByLabel(GOAL_START_DATE_FIELD_LABEL).fill(values.startDate);
  }
  if (values.endDate !== undefined) {
    await form.getByLabel(GOAL_END_DATE_FIELD_LABEL).fill(values.endDate);
  }
  if (values.progress !== undefined) {
    await form
      .getByLabel(GOAL_PROGRESS_FIELD_LABEL)
      .fill(String(values.progress));
  }
  if (values.status !== undefined) {
    await form.getByLabel(GOAL_STATUS_FIELD_LABEL).selectOption(values.status);
  }
}

export async function submitGoalCreateForm(page: Page): Promise<void> {
  await page
    .getByRole('form', { name: '目標作成' })
    .getByRole('button', {
      name: GOAL_CREATE_SUBMIT_LABEL,
    })
    .click();
}

export async function submitGoalEditForm(page: Page): Promise<void> {
  await page
    .getByRole('form', { name: '目標編集' })
    .getByRole('button', { name: GOAL_UPDATE_SUBMIT_LABEL })
    .click();
}

export async function expectGoalSuccessMessage(
  page: Page,
  message: string,
): Promise<void> {
  await expect(page.getByRole('status', { name: message })).toBeVisible();
}

export async function expectGoalValidationError(
  page: Page,
  message: string,
): Promise<void> {
  await expect(page.getByRole('alert')).toHaveText(message);
}

export function goalBarLocator(page: Page, title: string): Locator {
  return page.locator(`.gantt-chart__bar[data-goal-title="${title}"]`).first();
}

export async function expectGoalBarVisible(
  page: Page,
  title: string,
): Promise<void> {
  await expect(goalBarLocator(page, title)).toBeVisible({ timeout: 15_000 });
  await expect(
    page.locator('.gantt-chart__label', { hasText: title }).first(),
  ).toBeVisible();
}

export async function expectGoalBarAbsent(
  page: Page,
  title: string,
): Promise<void> {
  await expect(
    page.locator(`.gantt-chart__bar[data-goal-title="${title}"]`),
  ).toHaveCount(0);
}

export async function expectGoalListedOnManagePage(
  page: Page,
  title: string,
): Promise<void> {
  await expect(page.getByText(title, { exact: true })).toBeVisible();
}

export async function expectGoalAbsentOnManagePage(
  page: Page,
  title: string,
): Promise<void> {
  await expect(page.getByText(title, { exact: true })).toHaveCount(0);
}

function goalManageListItem(page: Page, title: string): Locator {
  return page.locator('.goal-manage-list__item').filter({
    has: page.locator('strong', { hasText: title }),
  });
}

export async function clickGoalEditButton(
  page: Page,
  title: string,
): Promise<void> {
  await goalManageListItem(page, title)
    .getByRole('button', { name: GOAL_EDIT_BUTTON_LABEL })
    .click();
  await expect(page.getByRole('form', { name: '目標編集' })).toBeVisible();
}

export async function clickGoalDeleteButton(
  page: Page,
  title: string,
): Promise<void> {
  await goalManageListItem(page, title)
    .getByRole('button', { name: GOAL_DELETE_BUTTON_LABEL })
    .click();
}

export async function expectDeleteButtonAbsentOnManagePage(
  page: Page,
): Promise<void> {
  await expect(
    page.getByRole('button', { name: GOAL_DELETE_BUTTON_LABEL }),
  ).toHaveCount(0);
}

async function dispatchMouseDrag(
  page: Page,
  target: Locator,
  deltaX: number,
): Promise<void> {
  await target.scrollIntoViewIfNeeded();
  const box = await target.boundingBox();
  if (!box) {
    throw new Error('Drag target has no bounding box');
  }

  const startX = box.x + box.width / 2;
  const startY = box.y + box.height / 2;
  const endX = startX + deltaX;

  await target.dispatchEvent('pointerdown', {
    bubbles: true,
    cancelable: true,
    clientX: startX,
    clientY: startY,
    button: 0,
    buttons: 1,
    pointerId: 1,
    pointerType: 'mouse',
    isPrimary: true,
  });
  await target.dispatchEvent('mousedown', {
    bubbles: true,
    cancelable: true,
    clientX: startX,
    clientY: startY,
    button: 0,
    buttons: 1,
  });

  await page.evaluate(
    ({ moveX, moveY, upX, upY }) => {
      const moveInit = {
        bubbles: true,
        cancelable: true,
        clientX: moveX,
        clientY: moveY,
        buttons: 1,
        pointerId: 1,
        pointerType: 'mouse',
        isPrimary: true,
      };
      const upInit = {
        bubbles: true,
        cancelable: true,
        clientX: upX,
        clientY: upY,
        button: 0,
        buttons: 0,
        pointerId: 1,
        pointerType: 'mouse',
        isPrimary: true,
      };
      document.dispatchEvent(new PointerEvent('pointermove', moveInit));
      document.dispatchEvent(new MouseEvent('mousemove', moveInit));
      document.dispatchEvent(new PointerEvent('pointerup', upInit));
      document.dispatchEvent(new MouseEvent('mouseup', upInit));
    },
    { moveX: endX, moveY: startY, upX: endX, upY: startY },
  );
}

export async function dragGoalBarByTitle(
  page: Page,
  title: string,
  deltaX: number,
): Promise<void> {
  await dispatchMouseDrag(page, goalBarLocator(page, title), deltaX);
}

export async function dragGoalBarEndByTitle(
  page: Page,
  title: string,
  deltaX: number,
): Promise<void> {
  const handle = page.locator(
    `.gantt-chart__bar[data-goal-title="${title}"] .gantt-chart__handle--end`,
  );
  await dispatchMouseDrag(page, handle, deltaX);
}

export async function expectGoalBarDates(
  page: Page,
  title: string,
  startDate: string,
  endDate: string,
): Promise<void> {
  const bar = goalBarLocator(page, title);
  await expect(bar).toHaveAttribute('data-start-date', startDate);
  await expect(bar).toHaveAttribute('data-end-date', endDate);
}

export async function deleteGoalViaTraineeApi(
  request: APIRequestContext,
  goalId: string,
): Promise<number> {
  const response = await request.delete(`/api/goals/${goalId}`, {
    headers: TRAINEE_API_HEADERS,
  });
  return response.status();
}

export async function createGoalViaApi(
  request: APIRequestContext,
  input: GoalFormValues,
  role: 'trainee' | 'trainer' = 'trainer',
): Promise<{ id: string; status: number }> {
  const headers =
    role === 'trainer' ? TRAINER_API_HEADERS : TRAINEE_API_HEADERS;
  const response = await request.post('/api/goals', {
    headers,
    data: {
      title: input.title,
      description: input.description,
      startDate: input.startDate,
      endDate: input.endDate,
      progress: input.progress ?? 0,
      status: input.status ?? 'not_started',
      traineeId: 'trainee-1',
    },
  });
  const body = (await response.json()) as { id: string };
  return { id: body.id, status: response.status() };
}

export function uniqueGoalTitle(prefix: string): string {
  return `${prefix}-${Date.now()}`;
}
