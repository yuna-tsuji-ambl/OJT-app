import { DEFAULT_TRAINEE_ID } from './participantConstants';

export const GOAL_STATUS_NOT_STARTED = 'not_started' as const;
export const GOAL_STATUS_IN_PROGRESS = 'in_progress' as const;
export const GOAL_STATUS_COMPLETED = 'completed' as const;
export const GOAL_STATUS_BLOCKED = 'blocked' as const;

export const GOAL_STATUSES = [
  GOAL_STATUS_NOT_STARTED,
  GOAL_STATUS_IN_PROGRESS,
  GOAL_STATUS_COMPLETED,
  GOAL_STATUS_BLOCKED,
] as const;

export type GoalStatus = (typeof GOAL_STATUSES)[number];

export const GOAL_INITIAL_PROGRESS = 0;
export const GOAL_INITIAL_STATUS = GOAL_STATUS_NOT_STARTED;
export const GOAL_TITLE_MAX_LENGTH = 100;
export const GOAL_DESCRIPTION_MAX_LENGTH = 1000;
export const GOAL_PROGRESS_MIN = 0;
export const GOAL_PROGRESS_MAX = 100;

export const GOAL_GANTT_PATH = '/goals';
export const GOAL_MANAGE_PATH = '/goals/manage';

export const GOAL_HEADER_NAV_LABEL = '目標';
export const GOAL_GANTT_PAGE_TITLE = '目標ガントチャート';
export const GOAL_MANAGE_PAGE_TITLE = '目標管理';
export const GOAL_GANTT_HEADING_ID = 'goal-gantt-heading';
export const GOAL_MANAGE_HEADING_ID = 'goal-manage-heading';

export const GOAL_GANTT_REGION_LABEL = '目標ガントチャート';
export const GOAL_MANAGE_LIST_REGION_LABEL = '目標一覧';
export const GOAL_CREATE_REGION_LABEL = '目標作成';
export const GOAL_EDIT_REGION_LABEL = '目標編集';

export const GOAL_MANAGE_LINK_LABEL = '目標管理へ';
export const GOAL_GANTT_LINK_LABEL = 'ガントチャートへ';

export const GOAL_TITLE_FIELD_LABEL = '目標名';
export const GOAL_TITLE_FIELD_ID = 'goal-title';
export const GOAL_DESCRIPTION_FIELD_LABEL = '説明';
export const GOAL_DESCRIPTION_FIELD_ID = 'goal-description';
export const GOAL_START_DATE_FIELD_LABEL = '開始日';
export const GOAL_START_DATE_FIELD_ID = 'goal-start-date';
export const GOAL_END_DATE_FIELD_LABEL = '終了日';
export const GOAL_END_DATE_FIELD_ID = 'goal-end-date';
export const GOAL_PROGRESS_FIELD_LABEL = '進捗率';
export const GOAL_PROGRESS_FIELD_ID = 'goal-progress';
export const GOAL_STATUS_FIELD_LABEL = 'ステータス';
export const GOAL_STATUS_FIELD_ID = 'goal-status';

export const GOAL_CREATE_SUBMIT_LABEL = '作成';
export const GOAL_UPDATE_SUBMIT_LABEL = '保存';
export const GOAL_DELETE_BUTTON_LABEL = '削除';
export const GOAL_EDIT_BUTTON_LABEL = '編集';

export const GOAL_CREATE_SUCCESS_MESSAGE = '目標を作成しました';
export const GOAL_UPDATE_SUCCESS_MESSAGE = '目標を更新しました';
export const GOAL_DELETE_SUCCESS_MESSAGE = '目標を削除しました';
export const GOAL_PERSIST_FAILED_MESSAGE = '保存に失敗しました';
export const GOAL_TITLE_REQUIRED_MESSAGE = '目標名を入力してください';
export const GOAL_INVALID_DATE_RANGE_MESSAGE =
  '終了日は開始日以降を指定してください';

export const GOAL_STATUS_LABELS: Record<GoalStatus, string> = {
  [GOAL_STATUS_NOT_STARTED]: '未着手',
  [GOAL_STATUS_IN_PROGRESS]: '進行中',
  [GOAL_STATUS_COMPLETED]: '完了',
  [GOAL_STATUS_BLOCKED]: 'ブロック',
};

export const GOAL_STATUS_OPTIONS = GOAL_STATUSES.map((status) => ({
  value: status,
  label: GOAL_STATUS_LABELS[status],
}));

export interface GoalResponse {
  readonly id: string;
  readonly traineeId: string;
  readonly createdBy: string;
  readonly title: string;
  readonly description?: string;
  readonly startDate: string;
  readonly endDate: string;
  readonly progress: number;
  readonly status: GoalStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CreateGoalInput {
  readonly title: string;
  readonly description?: string;
  readonly traineeId?: string;
  readonly startDate: string;
  readonly endDate: string;
  readonly progress?: number;
  readonly status?: GoalStatus;
}

export interface UpdateGoalInput {
  readonly title?: string;
  readonly description?: string;
  readonly startDate?: string;
  readonly endDate?: string;
  readonly progress?: number;
  readonly status?: GoalStatus;
}

export interface GoalFormValues {
  readonly title: string;
  readonly description: string;
  readonly startDate: string;
  readonly endDate: string;
  readonly progress: number;
  readonly status: GoalStatus;
}

export type GoalPersistFeedback =
  | { readonly type: 'success'; readonly message: string }
  | { readonly type: 'error'; readonly message: string }
  | null;

export function createEmptyGoalFormValues(): GoalFormValues {
  return {
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    progress: GOAL_INITIAL_PROGRESS,
    status: GOAL_INITIAL_STATUS,
  };
}

export function goalToFormValues(goal: GoalResponse): GoalFormValues {
  return {
    title: goal.title,
    description: goal.description ?? '',
    startDate: goal.startDate,
    endDate: goal.endDate,
    progress: goal.progress,
    status: goal.status,
  };
}

export function isValidGoalDateRange(
  startDate: string,
  endDate: string,
): boolean {
  if (!startDate || !endDate) {
    return false;
  }
  return startDate <= endDate;
}

export function validateGoalFormValues(values: GoalFormValues): string | null {
  if (values.title.trim().length === 0) {
    return GOAL_TITLE_REQUIRED_MESSAGE;
  }

  if (values.title.length > GOAL_TITLE_MAX_LENGTH) {
    return `目標名は${GOAL_TITLE_MAX_LENGTH}文字以内で入力してください`;
  }

  if (!isValidGoalDateRange(values.startDate, values.endDate)) {
    return GOAL_INVALID_DATE_RANGE_MESSAGE;
  }

  if (
    values.progress < GOAL_PROGRESS_MIN ||
    values.progress > GOAL_PROGRESS_MAX
  ) {
    return `進捗率は${GOAL_PROGRESS_MIN}〜${GOAL_PROGRESS_MAX}の範囲で入力してください`;
  }

  return null;
}

export function toCreateGoalInput(
  values: GoalFormValues,
  traineeId: string = DEFAULT_TRAINEE_ID,
): CreateGoalInput {
  return {
    title: values.title.trim(),
    description: values.description.trim() || undefined,
    traineeId,
    startDate: values.startDate,
    endDate: values.endDate,
    progress: values.progress,
    status: values.status,
  };
}

export function toUpdateGoalInput(values: GoalFormValues): UpdateGoalInput {
  return {
    title: values.title.trim(),
    description: values.description.trim() || undefined,
    startDate: values.startDate,
    endDate: values.endDate,
    progress: values.progress,
    status: values.status,
  };
}
