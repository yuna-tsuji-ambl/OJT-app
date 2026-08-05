import type {
  LearningPost,
  ListLearningsQuery,
} from '../learnings/learningTypes.js';
import {
  filterAndSortLearningPosts,
  type LearningRepository,
} from './learningRepository.js';

function cloneLearningPost(post: LearningPost): LearningPost {
  return structuredClone(post);
}

export class InMemoryLearningRepository implements LearningRepository {
  private readonly postsById = new Map<string, LearningPost>();

  async findAll(query: ListLearningsQuery): Promise<LearningPost[]> {
    const posts = [...this.postsById.values()].map((post) =>
      cloneLearningPost(post),
    );
    return filterAndSortLearningPosts(posts, query);
  }

  async findById(learningPostId: string): Promise<LearningPost | null> {
    const post = this.postsById.get(learningPostId);
    return post ? cloneLearningPost(post) : null;
  }

  async save(learningPost: LearningPost): Promise<LearningPost> {
    const stored = cloneLearningPost(learningPost);
    this.postsById.set(stored.id, stored);
    return cloneLearningPost(stored);
  }
}
