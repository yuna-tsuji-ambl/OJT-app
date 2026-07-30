export type {
  CreateGoalInput,
  Goal,
  ListGoalsQuery,
  UpdateGoalInput,
} from './goalTypes.js';

export type { GoalStatus } from './goalConstants.js';

export {
  GOAL_DESCRIPTION_MAX_LENGTH,
  GOAL_INITIAL_PROGRESS,
  GOAL_INITIAL_STATUS,
  GOAL_PROGRESS_MAX,
  GOAL_PROGRESS_MIN,
  GOAL_STATUS_BLOCKED,
  GOAL_STATUS_COMPLETED,
  GOAL_STATUS_IN_PROGRESS,
  GOAL_STATUS_NOT_STARTED,
  GOAL_TITLE_MAX_LENGTH,
} from './goalConstants.js';

export { createGoal, deleteGoal, listGoals, updateGoal } from './goalFacade.js';
