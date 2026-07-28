import type { Firestore } from '@google-cloud/firestore';
import {
  getFirestore,
  resetFirestoreForTests,
} from '../../firestore/client.js';
import { MESSAGE_FIRESTORE_COLLECTIONS } from '../../firestore/collections.js';
import { deleteAllDocumentsInCollection } from '../../firestore/deleteAllDocumentsInCollection.js';
import { seedFirestoreDefaults } from '../../firestore/seed.js';

const DEFAULT_TEST_GCP_PROJECT_ID = 'ojt-app-dev';

export async function clearFirestoreMessageCollections(
  db: Firestore,
): Promise<void> {
  await Promise.all(
    MESSAGE_FIRESTORE_COLLECTIONS.map((collectionName) =>
      deleteAllDocumentsInCollection(db, collectionName),
    ),
  );
}

export async function prepareFirestoreMessageTestEnvironment(): Promise<Firestore> {
  process.env.GCP_PROJECT_ID =
    process.env.GCP_PROJECT_ID ?? DEFAULT_TEST_GCP_PROJECT_ID;
  resetFirestoreForTests();

  const db = getFirestore();
  await clearFirestoreMessageCollections(db);
  await seedFirestoreDefaults(db);

  return db;
}
