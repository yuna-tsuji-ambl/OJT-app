import type { UserRole } from '@ojt-app/shared';

export interface AuthUser {
  userId: string;
  role: UserRole;
  /** Firebase ID token（`VITE_AUTH_MODE=firebase` 時） */
  idToken?: string;
}

export type { UserRole };
