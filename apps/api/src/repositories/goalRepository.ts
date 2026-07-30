import type { Goal } from '../goals/goalTypes.js';

export interface GoalRepository {
  findByTraineeId(traineeId: string): Promise<Goal[]>;
  findById(goalId: string): Promise<Goal | null>;
  save(goal: Goal): Promise<Goal>;
  delete(goalId: string): Promise<void>;
}
