import type { UserRole } from '@ojt-app/shared';

export interface AuthUser {
  userId: string;
  role: UserRole;
}

export type { UserRole };
