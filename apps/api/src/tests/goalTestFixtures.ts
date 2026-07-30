import {
  GOAL_INITIAL_PROGRESS,
  GOAL_INITIAL_STATUS,
  GOAL_STATUS_IN_PROGRESS,
  GOAL_TITLE_MAX_LENGTH,
} from '../goals/goalConstants.js';
import type { GoalRepository } from '../repositories/goalRepository.js';
import { invokeGoalRoute } from './goalRouteTestHelpers.js';

export const TRAINEE_USER_ID = 'trainee-1';
export const TRAINER_USER_ID = 'trainer-1';
export const OTHER_TRAINEE_USER_ID = 'trainee-2';

export const U_G01_TITLE = 'TypeScript 基礎を習得する';
export const U_G01_START_DATE = '2026-08-01';
export const U_G01_END_DATE = '2026-08-31';

export const U_G01_POST_BODY = {
  title: U_G01_TITLE,
  traineeId: TRAINEE_USER_ID,
  startDate: U_G01_START_DATE,
  endDate: U_G01_END_DATE,
};

export const U_G02_GOAL_A = {
  title: '目標A',
  traineeId: TRAINEE_USER_ID,
  startDate: '2026-09-01',
  endDate: '2026-09-15',
};

export const U_G02_GOAL_B = {
  title: '目標B',
  traineeId: TRAINEE_USER_ID,
  startDate: '2026-09-16',
  endDate: '2026-09-30',
};

export const U_G04_PROGRESS = 50;

export const U_G05_UPDATED_TITLE = '更新後の目標名';
export const U_G05_UPDATED_START_DATE = '2026-10-01';
export const U_G05_UPDATED_END_DATE = '2026-10-15';

export const U_G07_EMPTY_TITLE_POST_BODY = {
  title: '',
  traineeId: TRAINEE_USER_ID,
  startDate: U_G01_START_DATE,
  endDate: U_G01_END_DATE,
};

export const U_G08_INVALID_RANGE_POST_BODY = {
  title: U_G01_TITLE,
  traineeId: TRAINEE_USER_ID,
  startDate: '2026-08-10',
  endDate: '2026-08-01',
};

export const U_G09_INVALID_DATE_POST_BODY = {
  title: U_G01_TITLE,
  traineeId: TRAINEE_USER_ID,
  startDate: '2026-13-40',
  endDate: U_G01_END_DATE,
};

export const U_G10_INVALID_STATUS_PUT_BODY = {
  status: 'done',
};

export const U_G11_POST_BODY = {
  title: '新卒が作成した目標',
  startDate: '2026-11-01',
  endDate: '2026-11-30',
};

export const U_G16_PROGRESS = 0;
export const U_G17_PROGRESS = 100;
export const U_G18_PROGRESS = -1;
export const U_G19_PROGRESS = 101;

export const U_G20_SAME_DAY = '2026-08-01';
export const U_G20_POST_BODY = {
  title: '1日目標',
  traineeId: TRAINEE_USER_ID,
  startDate: U_G20_SAME_DAY,
  endDate: U_G20_SAME_DAY,
};

export const U_G21_TITLE = 'a'.repeat(GOAL_TITLE_MAX_LENGTH);
export const U_G21_POST_BODY = {
  title: U_G21_TITLE,
  traineeId: TRAINEE_USER_ID,
  startDate: U_G01_START_DATE,
  endDate: U_G01_END_DATE,
};

export const U_G22_TITLE = 'a'.repeat(GOAL_TITLE_MAX_LENGTH + 1);
export const U_G22_POST_BODY = {
  title: U_G22_TITLE,
  traineeId: TRAINEE_USER_ID,
  startDate: U_G01_START_DATE,
  endDate: U_G01_END_DATE,
};

export const I_G01_POST_BODY = U_G01_POST_BODY;
export const I_G02_PROGRESS = 75;

export type GoalAuthHeaders = {
  'x-user-id': string;
  'x-user-role': string;
};

export function createTraineeHeaders(userId: string): GoalAuthHeaders {
  return {
    'x-user-id': userId,
    'x-user-role': 'trainee',
  };
}

export function createTrainerHeaders(userId: string): GoalAuthHeaders {
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
export const UNAUTHENTICATED_HEADERS = {} as Record<string, string>;

export async function getGoals(
  query: Record<string, string>,
  goalRepository: GoalRepository,
  headers: Record<string, string> = TRAINEE_HEADERS,
): Promise<{ statusCode: number; body: unknown }> {
  return invokeGoalRoute(goalRepository, {
    method: 'get',
    path: '/goals',
    query,
    headers,
  });
}

export async function postGoal(
  body: unknown,
  goalRepository: GoalRepository,
  headers: Record<string, string> = TRAINER_HEADERS,
): Promise<{ statusCode: number; body: unknown }> {
  return invokeGoalRoute(goalRepository, {
    method: 'post',
    path: '/goals',
    body,
    headers,
  });
}

export async function putGoal(
  goalId: string,
  body: unknown,
  goalRepository: GoalRepository,
  headers: Record<string, string> = TRAINEE_HEADERS,
): Promise<{ statusCode: number; body: unknown }> {
  return invokeGoalRoute(goalRepository, {
    method: 'put',
    path: '/goals/:id',
    params: { id: goalId },
    body,
    headers,
  });
}

export async function deleteGoal(
  goalId: string,
  goalRepository: GoalRepository,
  headers: Record<string, string> = TRAINER_HEADERS,
): Promise<{ statusCode: number; body: unknown }> {
  return invokeGoalRoute(goalRepository, {
    method: 'delete',
    path: '/goals/:id',
    params: { id: goalId },
    headers,
  });
}

export {
  GOAL_INITIAL_PROGRESS,
  GOAL_INITIAL_STATUS,
  GOAL_STATUS_IN_PROGRESS,
  GOAL_TITLE_MAX_LENGTH,
};
