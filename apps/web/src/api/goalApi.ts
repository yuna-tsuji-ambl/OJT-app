import type { AuthUser } from '../auth/types';
import { DEFAULT_TRAINEE_ID } from '../domain/participantConstants';
import type {
  CreateGoalInput,
  GoalResponse,
  UpdateGoalInput,
} from '../domain/goalForm';
import { fetchWithAuth } from './authHeaders';

const GOALS_API_PATH = '/api/goals';

function buildGoalsListApiPath(traineeId?: string): string {
  if (traineeId === undefined) {
    return GOALS_API_PATH;
  }
  const query = new URLSearchParams({ traineeId });
  return `${GOALS_API_PATH}?${query.toString()}`;
}

function buildGoalByIdApiPath(goalId: string): string {
  return `${GOALS_API_PATH}/${goalId}`;
}

function resolveTraineeIdForList(
  user: AuthUser,
  traineeId?: string,
): string | undefined {
  if (user.role === 'trainer') {
    return traineeId ?? DEFAULT_TRAINEE_ID;
  }
  return traineeId;
}

async function parseGoalError(
  response: Response,
  fallbackMessage: string,
): Promise<never> {
  const body: unknown = await response.json().catch(() => null);
  const apiError =
    typeof body === 'object' &&
    body !== null &&
    'error' in body &&
    typeof body.error === 'string'
      ? body.error
      : fallbackMessage;
  throw new Error(apiError);
}

/** ガント用目標一覧を取得する（GET /api/goals） */
export async function fetchGoals(
  user: AuthUser,
  traineeId?: string,
): Promise<readonly GoalResponse[]> {
  const resolvedTraineeId = resolveTraineeIdForList(user, traineeId);
  const response = await fetchWithAuth(
    buildGoalsListApiPath(resolvedTraineeId),
    user,
  );

  if (!response.ok) {
    return parseGoalError(response, 'Failed to fetch goals');
  }

  return response.json() as Promise<readonly GoalResponse[]>;
}

/** 目標を作成する（POST /api/goals） */
export async function createGoal(
  input: CreateGoalInput,
  user: AuthUser,
): Promise<GoalResponse> {
  const response = await fetchWithAuth(GOALS_API_PATH, user, {
    method: 'POST',
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    return parseGoalError(response, 'Failed to create goal');
  }

  return response.json() as Promise<GoalResponse>;
}

/** 目標を更新する（PUT /api/goals/:id） */
export async function updateGoal(
  goalId: string,
  input: UpdateGoalInput,
  user: AuthUser,
): Promise<GoalResponse> {
  const response = await fetchWithAuth(buildGoalByIdApiPath(goalId), user, {
    method: 'PUT',
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    return parseGoalError(response, 'Failed to update goal');
  }

  return response.json() as Promise<GoalResponse>;
}

/** 目標を削除する（DELETE /api/goals/:id） */
export async function deleteGoal(
  goalId: string,
  user: AuthUser,
): Promise<void> {
  const response = await fetchWithAuth(buildGoalByIdApiPath(goalId), user, {
    method: 'DELETE',
  });

  if (!response.ok) {
    return parseGoalError(response, 'Failed to delete goal');
  }
}
