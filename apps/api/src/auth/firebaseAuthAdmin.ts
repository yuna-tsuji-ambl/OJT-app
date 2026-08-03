import { applicationDefault, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { FIRESTORE_COLLECTIONS } from '../firestore/collections.js';
import type { UserRole } from '../domain/types.js';
import {
  setAuthDependencies,
  type AuthDependencies,
} from './authDependencies.js';

function ensureFirebaseAdminApp(): void {
  if (getApps().length > 0) {
    return;
  }

  const projectId = process.env.GCP_PROJECT_ID ?? 'ojt-app';
  const useEmulator = Boolean(process.env.FIREBASE_AUTH_EMULATOR_HOST);

  if (useEmulator) {
    initializeApp({ projectId });
    return;
  }

  initializeApp({
    credential: applicationDefault(),
    projectId,
  });
}

function parseRole(value: unknown): UserRole | null {
  if (value === 'trainee' || value === 'trainer') {
    return value;
  }

  return null;
}

export function createFirebaseAuthDependencies(): AuthDependencies {
  ensureFirebaseAdminApp();
  const auth = getAuth();
  const firestore = getFirestore();

  return {
    async verifyIdToken(idToken: string) {
      const decoded = await auth.verifyIdToken(idToken);
      return { uid: decoded.uid };
    },
    async findAppUser(uid: string) {
      const snapshot = await firestore
        .collection(FIRESTORE_COLLECTIONS.USERS)
        .doc(uid)
        .get();

      if (!snapshot.exists) {
        return null;
      }

      const role = parseRole(snapshot.get('role'));
      if (!role) {
        return null;
      }

      return { role };
    },
  };
}

export function configureFirebaseAuthDependencies(): void {
  setAuthDependencies(createFirebaseAuthDependencies());
}
