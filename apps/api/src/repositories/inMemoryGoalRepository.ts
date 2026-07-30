import type { Goal } from '../goals/goalTypes.js';
import type { GoalRepository } from './goalRepository.js';

function cloneGoal(goal: Goal): Goal {
  return structuredClone(goal);
}

export class InMemoryGoalRepository implements GoalRepository {
  private readonly goalsById = new Map<string, Goal>();

  async findByTraineeId(traineeId: string): Promise<Goal[]> {
    return [...this.goalsById.values()]
      .filter((goal) => goal.traineeId === traineeId)
      .map((goal) => cloneGoal(goal));
  }

  async findById(goalId: string): Promise<Goal | null> {
    const goal = this.goalsById.get(goalId);
    return goal ? cloneGoal(goal) : null;
  }

  async save(goal: Goal): Promise<Goal> {
    const stored = cloneGoal(goal);
    this.goalsById.set(stored.id, stored);
    return cloneGoal(stored);
  }

  async delete(goalId: string): Promise<void> {
    this.goalsById.delete(goalId);
  }
}
