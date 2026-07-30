import type { GoalRepository } from './goalRepository.js';
import { InMemoryGoalRepository } from './inMemoryGoalRepository.js';

export function createInMemoryGoalRepository(): GoalRepository {
  return new InMemoryGoalRepository();
}
