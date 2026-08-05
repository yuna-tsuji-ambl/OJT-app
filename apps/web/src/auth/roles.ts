import type { UserRole } from './types';

export const USER_ROLE_TRAINER = 'trainer' as const satisfies UserRole;
export const USER_ROLE_TRAINEE = 'trainee' as const satisfies UserRole;

export function isTrainerRole(role: UserRole): boolean {
  return role === USER_ROLE_TRAINER;
}

export function isTraineeRole(role: UserRole): boolean {
  return role === USER_ROLE_TRAINEE;
}
