import { toUserContext } from '../domain/userContext.js';
import type { UserContext, UserRole } from '../domain/types.js';
import type { LearningRepository } from '../repositories/learningRepository.js';
import {
  createLearningPostCommand,
  listLearningsCommand,
} from './learningCommands.js';
import type {
  CreateLearningPostInput,
  LearningPost,
  ListLearningsQuery,
} from './learningTypes.js';

async function runWithUserContext<T>(
  userId: string,
  role: UserRole,
  execute: (context: UserContext) => Promise<T>,
): Promise<T> {
  return execute(toUserContext(userId, role));
}

export async function listLearnings(
  query: ListLearningsQuery,
  userId: string,
  role: UserRole,
  learningRepository: LearningRepository,
): Promise<LearningPost[]> {
  return runWithUserContext(userId, role, (context) =>
    listLearningsCommand(query, context, learningRepository),
  );
}

export async function createLearningPost(
  input: CreateLearningPostInput,
  userId: string,
  role: UserRole,
  learningRepository: LearningRepository,
): Promise<LearningPost> {
  return runWithUserContext(userId, role, (context) =>
    createLearningPostCommand(input, context, learningRepository),
  );
}
