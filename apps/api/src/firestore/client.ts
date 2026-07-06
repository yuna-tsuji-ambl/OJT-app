import { Firestore } from '@google-cloud/firestore';

const DEFAULT_PROJECT_ID = 'ojt-app-dev';
const DEFAULT_DATABASE_ID = '(default)';

let firestoreInstance: Firestore | null = null;

export function getFirestore(): Firestore {
  if (!firestoreInstance) {
    firestoreInstance = new Firestore({
      projectId: process.env.GCP_PROJECT_ID ?? DEFAULT_PROJECT_ID,
      databaseId: process.env.FIRESTORE_DATABASE_ID ?? DEFAULT_DATABASE_ID,
    });
  }

  return firestoreInstance;
}

export function resetFirestoreForTests(): void {
  firestoreInstance = null;
}
