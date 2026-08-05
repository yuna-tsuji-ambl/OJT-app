import type { DocumentData, Firestore } from '@google-cloud/firestore';
import { expect } from 'vitest';
import { getFirestore, resetFirestoreForTests } from '../firestore/client.js';
import { FIRESTORE_COLLECTIONS } from '../firestore/collections.js';
import { FirestoreLearningRepository } from '../repositories/firestore/firestoreLearningRepository.js';
import type { LearningRepository } from '../repositories/learningRepository.js';
import { ensureFirestoreEmulatorEnv } from './firestoreEmulatorEnv.js';

export interface LearningFirestoreTestContext {
  db: Firestore;
  repository: LearningRepository;
}

const LEARNING_API_FIRESTORE_ALIGNMENT_FIELDS = [
  'id',
  'authorId',
  'date',
  'title',
  'body',
  'links',
  'createdAt',
  'updatedAt',
] as const;

export function createLearningFirestoreTestContext(): LearningFirestoreTestContext {
  ensureFirestoreEmulatorEnv();
  resetFirestoreForTests();
  const db = getFirestore();

  return {
    db,
    repository: new FirestoreLearningRepository(db),
  };
}

export function resetLearningFirestoreTestContext(): void {
  resetFirestoreForTests();
}

export async function clearLearningPostsCollection(
  db: Firestore,
): Promise<void> {
  const snapshot = await db
    .collection(FIRESTORE_COLLECTIONS.LEARNING_POSTS)
    .get();
  await Promise.all(snapshot.docs.map((document) => document.ref.delete()));
}

export async function findLearningPostsInFirestore(
  db: Firestore,
): Promise<DocumentData[]> {
  const snapshot = await db
    .collection(FIRESTORE_COLLECTIONS.LEARNING_POSTS)
    .get();

  return snapshot.docs.map((document) => document.data());
}

export async function readLearningPostDocumentById(
  db: Firestore,
  learningPostId: string,
): Promise<DocumentData | undefined> {
  const snapshot = await db
    .collection(FIRESTORE_COLLECTIONS.LEARNING_POSTS)
    .doc(learningPostId)
    .get();
  return snapshot.exists ? snapshot.data() : undefined;
}

export function expectLearningPostPersistedInFirestore(
  stored: DocumentData,
  expected: Record<string, unknown>,
): void {
  expect(stored).toEqual(expect.objectContaining(expected));
  expect(stored.id).toBeTruthy();
}

export function expectApiResponseMatchesStoredLearningPost(
  responseBody: unknown,
  stored: DocumentData,
): void {
  const expected = Object.fromEntries(
    LEARNING_API_FIRESTORE_ALIGNMENT_FIELDS.flatMap((field) => {
      const value = stored[field];
      return value === undefined ? [] : [[field, value]];
    }),
  );

  expect(responseBody).toEqual(expect.objectContaining(expected));
}

export function expectLearningsSortedByDateDesc(
  posts: Array<{ date: string; createdAt: string }>,
): void {
  for (let index = 1; index < posts.length; index += 1) {
    const previous = posts[index - 1]!;
    const current = posts[index]!;

    if (previous.date === current.date) {
      expect(
        previous.createdAt.localeCompare(current.createdAt),
      ).toBeGreaterThanOrEqual(0);
      continue;
    }

    expect(previous.date.localeCompare(current.date)).toBeGreaterThanOrEqual(0);
  }
}
