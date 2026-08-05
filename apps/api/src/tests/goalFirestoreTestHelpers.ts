import type { DocumentData, Firestore } from '@google-cloud/firestore';
import { expect } from 'vitest';
import { getFirestore, resetFirestoreForTests } from '../firestore/client.js';
import { FIRESTORE_COLLECTIONS } from '../firestore/collections.js';
import { FirestoreGoalRepository } from '../repositories/firestore/firestoreGoalRepository.js';
import type { GoalRepository } from '../repositories/goalRepository.js';
import { ensureFirestoreEmulatorEnv } from './firestoreEmulatorEnv.js';

export interface GoalFirestoreTestContext {
  db: Firestore;
  repository: GoalRepository;
}

const GOAL_API_FIRESTORE_ALIGNMENT_FIELDS = [
  'id',
  'traineeId',
  'createdBy',
  'title',
  'description',
  'startDate',
  'endDate',
  'progress',
  'status',
  'createdAt',
  'updatedAt',
] as const;

export function createGoalFirestoreTestContext(): GoalFirestoreTestContext {
  ensureFirestoreEmulatorEnv();
  resetFirestoreForTests();
  const db = getFirestore();

  return {
    db,
    repository: new FirestoreGoalRepository(db),
  };
}

export function resetGoalFirestoreTestContext(): void {
  resetFirestoreForTests();
}

export async function clearGoalsCollection(db: Firestore): Promise<void> {
  const snapshot = await db.collection(FIRESTORE_COLLECTIONS.GOALS).get();
  await Promise.all(snapshot.docs.map((document) => document.ref.delete()));
}

export async function findGoalsInFirestore(
  db: Firestore,
  traineeId: string,
): Promise<DocumentData[]> {
  const snapshot = await db
    .collection(FIRESTORE_COLLECTIONS.GOALS)
    .where('traineeId', '==', traineeId)
    .get();

  return snapshot.docs.map((document) => document.data());
}

export async function readGoalDocumentById(
  db: Firestore,
  goalId: string,
): Promise<DocumentData | undefined> {
  const snapshot = await db
    .collection(FIRESTORE_COLLECTIONS.GOALS)
    .doc(goalId)
    .get();
  return snapshot.exists ? snapshot.data() : undefined;
}

export function expectGoalPersistedInFirestore(
  stored: DocumentData,
  expected: Record<string, unknown>,
): void {
  expect(stored).toEqual(expect.objectContaining(expected));
  expect(stored.id).toBeTruthy();
}

export function expectApiResponseMatchesStoredGoal(
  responseBody: unknown,
  stored: DocumentData,
): void {
  const expected = Object.fromEntries(
    GOAL_API_FIRESTORE_ALIGNMENT_FIELDS.flatMap((field) => {
      const value = stored[field];
      return value === undefined ? [] : [[field, value]];
    }),
  );

  expect(responseBody).toEqual(expect.objectContaining(expected));
}

export function expectForbiddenOrEmptyGoalList(response: {
  statusCode: number;
  body: unknown;
}): void {
  const isForbidden = response.statusCode === 403;
  const isEmptyList =
    response.statusCode === 200 &&
    Array.isArray(response.body) &&
    response.body.length === 0;

  expect(isForbidden || isEmptyList).toBe(true);
}
