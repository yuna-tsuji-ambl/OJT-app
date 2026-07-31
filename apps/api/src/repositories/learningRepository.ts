import type {
  LearningPost,
  ListLearningsQuery,
} from '../learnings/learningTypes.js';

export interface LearningRepository {
  findAll(query: ListLearningsQuery): Promise<LearningPost[]>;
  findById(learningPostId: string): Promise<LearningPost | null>;
  save(learningPost: LearningPost): Promise<LearningPost>;
}

function matchesDateRange(
  date: string,
  from: string | undefined,
  to: string | undefined,
): boolean {
  if (from !== undefined && date < from) {
    return false;
  }

  if (to !== undefined && date > to) {
    return false;
  }

  return true;
}

export function filterAndSortLearningPosts(
  posts: LearningPost[],
  query: ListLearningsQuery,
): LearningPost[] {
  return posts
    .filter((post) => {
      if (query.authorId !== undefined && post.authorId !== query.authorId) {
        return false;
      }

      return matchesDateRange(post.date, query.from, query.to);
    })
    .sort((left, right) => {
      if (left.date !== right.date) {
        return right.date.localeCompare(left.date);
      }

      return right.createdAt.localeCompare(left.createdAt);
    });
}
