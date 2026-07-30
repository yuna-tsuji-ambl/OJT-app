export type {
  CreateGoalInput,
  Goal,
  GoalStatus,
  ListGoalsQuery,
  UpdateGoalInput,
} from './goals/goalPublicSurface.js';

export type { GoalRepository } from './repositories/goalRepository.js';

export {
  createGoal,
  deleteGoal,
  listGoals,
  updateGoal,
  GOAL_INITIAL_PROGRESS,
  GOAL_INITIAL_STATUS,
  GOAL_TITLE_MAX_LENGTH,
} from './goals/goalPublicSurface.js';
