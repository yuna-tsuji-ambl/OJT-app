import type { Firestore } from '@google-cloud/firestore';
import { SEED_ASSIGNMENTS } from '../domain/assignmentConstants.js';
import { TRAINER_STATUS } from '../domain/statusConstants.js';
import { DEFAULT_TRAINER_ID } from '../domain/userIds.js';
import { FIRESTORE_COLLECTIONS } from '../firestore/collections.js';
import { toAssignmentDocument } from '../repositories/firestore/assignmentFirestoreMappers.js';

export async function seedAssignmentsIfEmpty(db: Firestore): Promise<void> {
  const snapshot = await db
    .collection(FIRESTORE_COLLECTIONS.ASSIGNMENTS)
    .limit(1)
    .get();

  if (!snapshot.empty) {
    return;
  }

  const batch = db.batch();

  for (const assignment of SEED_ASSIGNMENTS) {
    const reference = db
      .collection(FIRESTORE_COLLECTIONS.ASSIGNMENTS)
      .doc(assignment.id);
    batch.set(reference, toAssignmentDocument(assignment));
  }

  await batch.commit();
}

export async function seedTrainerStatusIfMissing(db: Firestore): Promise<void> {
  const reference = db
    .collection(FIRESTORE_COLLECTIONS.TRAINER_STATUSES)
    .doc(DEFAULT_TRAINER_ID);
  const document = await reference.get();

  if (document.exists) {
    return;
  }

  await reference.set({
    userId: DEFAULT_TRAINER_ID,
    status: TRAINER_STATUS.FOCUS_MODE,
  });
}

export async function seedFirestoreDefaults(db: Firestore): Promise<void> {
  await Promise.all([
    seedAssignmentsIfEmpty(db),
    seedTrainerStatusIfMissing(db),
  ]);
}
