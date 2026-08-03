import { deleteApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import {
  configureFirebaseAuthDependencies,
  createFirebaseAuthDependencies,
} from '../auth/firebaseAuthAdmin.js';
import { resetAuthDependencies } from '../auth/authDependencies.js';
import { FIRESTORE_COLLECTIONS } from '../firestore/collections.js';
import type { UserRole } from '../domain/types.js';
import { getAuthEmulatorHost } from './authEmulatorEnv.js';

export async function resetFirebaseAdminApps(): Promise<void> {
  resetAuthDependencies();
  await Promise.all(getApps().map((app) => deleteApp(app)));
}

export async function bootstrapFirebaseAuthForEmulator(): Promise<void> {
  await resetFirebaseAdminApps();
  configureFirebaseAuthDependencies();
}

export async function createEmulatorAuthUser(input: {
  email: string;
  password: string;
  role: UserRole;
  displayName?: string;
}): Promise<{ uid: string; idToken: string }> {
  // Ensure admin app exists
  createFirebaseAuthDependencies();
  const auth = getAuth();
  const firestore = getFirestore();

  const user = await auth.createUser({
    email: input.email,
    password: input.password,
    displayName: input.displayName,
  });

  await firestore
    .collection(FIRESTORE_COLLECTIONS.USERS)
    .doc(user.uid)
    .set({
      role: input.role,
      displayName: input.displayName ?? input.email,
      createdAt: new Date().toISOString(),
    });

  const idToken = await signInAndGetIdToken(input.email, input.password);
  return { uid: user.uid, idToken };
}

export async function signInAndGetIdToken(
  email: string,
  password: string,
): Promise<string> {
  const host = getAuthEmulatorHost();
  const projectId = process.env.GCP_PROJECT_ID ?? 'ojt-app';
  const url = `http://${host}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=fake-api-key`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password,
      returnSecureToken: true,
      // Emulator accepts project via tenant; key is ignored
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Auth Emulator sign-in failed (${response.status}) project=${projectId}: ${text}`,
    );
  }

  const body = (await response.json()) as { idToken?: string };
  if (!body.idToken) {
    throw new Error('Auth Emulator sign-in response missing idToken');
  }

  return body.idToken;
}

export async function clearEmulatorUsersCollection(): Promise<void> {
  createFirebaseAuthDependencies();
  const firestore = getFirestore();
  const snapshot = await firestore
    .collection(FIRESTORE_COLLECTIONS.USERS)
    .get();
  await Promise.all(snapshot.docs.map((doc) => doc.ref.delete()));
}
