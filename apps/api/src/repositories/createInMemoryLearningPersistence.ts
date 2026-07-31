import type { LearningRepository } from './learningRepository.js';
import { InMemoryLearningRepository } from './inMemoryLearningRepository.js';

export function createInMemoryLearningRepository(): LearningRepository {
  return new InMemoryLearningRepository();
}
