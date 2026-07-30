import type { GoalStatus } from './goalConstants.js';

export interface Goal {
  id: string;
  traineeId: string;
  createdBy: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  progress: number;
  status: GoalStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGoalInput {
  title: string;
  description?: string;
  traineeId?: string;
  startDate: string;
  endDate: string;
  progress?: number;
  status?: GoalStatus;
}

export interface UpdateGoalInput {
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  progress?: number;
  status?: GoalStatus;
}

export interface ListGoalsQuery {
  traineeId?: string;
}
