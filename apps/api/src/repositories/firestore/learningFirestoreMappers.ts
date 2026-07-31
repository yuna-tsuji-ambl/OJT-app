import type { DocumentData } from '@google-cloud/firestore';
import type { LearningPost } from '../../learnings/learningTypes.js';

export type LearningPostDocument = LearningPost;

function includeDefinedField<K extends string, V>(
  key: K,
  value: V | undefined,
): Partial<Record<K, V>> {
  if (value === undefined) {
    return {};
  }

  return { [key]: value } as Partial<Record<K, V>>;
}

function toLearningLinkDocument(link: LearningPost['links'][number]) {
  return {
    url: link.url,
    ...includeDefinedField('label', link.label),
  };
}

export function toLearningPostDocument(
  post: LearningPost,
): LearningPostDocument {
  return {
    id: post.id,
    authorId: post.authorId,
    date: post.date,
    title: post.title,
    body: post.body,
    links: post.links.map((link) => toLearningLinkDocument(link)),
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  };
}

export function fromLearningPostDocument(
  data: DocumentData | LearningPostDocument | undefined,
): LearningPost {
  if (!data) {
    throw new Error('Learning post document data is required');
  }

  return toLearningPostDocument(data as LearningPostDocument);
}
