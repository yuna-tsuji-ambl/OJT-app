import type { Firestore, Query } from '@google-cloud/firestore';
import type {
  LearningPost,
  ListLearningsQuery,
} from '../../learnings/learningTypes.js';
import { FIRESTORE_COLLECTIONS } from '../../firestore/collections.js';
import {
  filterAndSortLearningPosts,
  type LearningRepository,
} from '../learningRepository.js';
import {
  fromLearningPostDocument,
  toLearningPostDocument,
} from './learningFirestoreMappers.js';

export class FirestoreLearningRepository implements LearningRepository {
  constructor(private readonly db: Firestore) {}

  private learningPostsCollection() {
    return this.db.collection(FIRESTORE_COLLECTIONS.LEARNING_POSTS);
  }

  async findAll(query: ListLearningsQuery): Promise<LearningPost[]> {
    let collectionQuery: Query = this.learningPostsCollection();

    if (query.authorId !== undefined) {
      collectionQuery = collectionQuery.where('authorId', '==', query.authorId);
    }

    const snapshot = await collectionQuery.get();
    const posts = snapshot.docs.map((document) =>
      fromLearningPostDocument(document.data()),
    );

    return filterAndSortLearningPosts(posts, query);
  }

  async findById(learningPostId: string): Promise<LearningPost | null> {
    const snapshot = await this.learningPostsCollection()
      .doc(learningPostId)
      .get();

    if (!snapshot.exists) {
      return null;
    }

    return fromLearningPostDocument(snapshot.data());
  }

  async save(learningPost: LearningPost): Promise<LearningPost> {
    const document = toLearningPostDocument(learningPost);
    await this.learningPostsCollection().doc(learningPost.id).set(document);
    return fromLearningPostDocument(document);
  }
}
