import type { LearningRepository } from '../repositories/learningRepository.js';
import { ensureTraineeCanCreateLearning } from './learningAccess.js';
import { buildLearningPost } from './buildLearningPost.js';
import type { UserContext } from '../domain/types.js';
import type {
  CreateLearningPostInput,
  LearningPost,
  ListLearningsQuery,
} from './learningTypes.js';
import { validateCreateLearningPostInput } from './learningValidation.js';

export async function listLearningsCommand(
  query: ListLearningsQuery,
  _context: UserContext,
  learningRepository: LearningRepository,
): Promise<LearningPost[]> {
  return learningRepository.findAll(query);
}

export async function createLearningPostCommand(
  input: CreateLearningPostInput,
  context: UserContext,
  learningRepository: LearningRepository,
): Promise<LearningPost> {
  ensureTraineeCanCreateLearning(context);
  validateCreateLearningPostInput(input);

  const learningPost = buildLearningPost({
    input,
    authorId: context.userId,
  });

  return learningRepository.save(learningPost);
}
