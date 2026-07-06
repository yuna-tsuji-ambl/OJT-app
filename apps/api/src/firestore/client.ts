import { Firestore } from '@google-cloud/firestore';

const DEFAULT_PROJECT_ID = 'ojt-app-dev';

let firestoreInstance: Firestore | null = null;

export function getFirestore(): Firestore {
  if (!firestoreInstance) {
    firestoreInstance = new Firestore({
      projectId: process.env.GCP_PROJECT_ID ?? DEFAULT_PROJECT_ID,
    });
  }

  return firestoreInstance;
}

export function resetFirestoreForTests(): void {
  firestoreInstance = null;
}
