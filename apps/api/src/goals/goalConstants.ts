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
