import { SEED_ASSIGNMENTS } from '../domain/assignmentConstants.js';
import type { AssignmentRepository } from './assignmentRepository.js';
import { AssignmentMemory } from './assignmentMemory.js';
import { InMemoryAssignmentRepository } from './inMemoryAssignmentRepository.js';

export function createInMemoryAssignmentRepository(): AssignmentRepository {
  return new InMemoryAssignmentRepository(
    new AssignmentMemory(SEED_ASSIGNMENTS),
  );
}
