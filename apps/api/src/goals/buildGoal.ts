import {
  GOAL_INITIAL_PROGRESS,
  GOAL_INITIAL_STATUS,
  type GoalStatus,
} from './goalConstants.js';
import type { CreateGoalInput, Goal } from './goalTypes.js';

export interface BuildGoalParams {
  input: CreateGoalInput;
  traineeId: string;
  createdBy: string;
  existing?: Goal | null;
  now?: string;
}

export function buildGoal({
  input,
  traineeId,
  createdBy,
  existing = null,
  now = new Date().toISOString(),
}: BuildGoalParams): Goal {
  const progress =
    input.progress ?? existing?.progress ?? GOAL_INITIAL_PROGRESS;
  const status: GoalStatus =
    input.status ?? existing?.status ?? GOAL_INITIAL_STATUS;

  const goal: Goal = {
    id: existing?.id ?? crypto.randomUUID(),
    traineeId,
    createdBy: existing?.createdBy ?? createdBy,
    title: input.title,
    startDate: input.startDate,
    endDate: input.endDate,
    progress,
    status,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  if (input.description !== undefined) {
    goal.description = input.description;
  } else if (existing?.description !== undefined) {
    goal.description = existing.description;
  }

  return goal;
}
