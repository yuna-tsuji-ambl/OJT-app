import type { UserRole } from '../domain/types.js';

export interface VerifiedIdToken {
  uid: string;
}

export interface AppUserRecord {
  role: UserRole;
}

export interface AuthDependencies {
  verifyIdToken(idToken: string): Promise<VerifiedIdToken>;
  findAppUser(uid: string): Promise<AppUserRecord | null>;
}

let authDependencies: AuthDependencies | null = null;

export function setAuthDependencies(dependencies: AuthDependencies): void {
  authDependencies = dependencies;
}

export function resetAuthDependencies(): void {
  authDependencies = null;
}

export function getAuthDependencies(): AuthDependencies {
  if (!authDependencies) {
    throw new Error(
      'Auth dependencies are not configured. Call configureFirebaseAuthDependencies() when AUTH_MODE=firebase.',
    );
  }

  return authDependencies;
}
