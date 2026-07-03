import { ForbiddenError } from './errors.js';
import type { UserContext, UserRole } from './types.js';

export function ensureRole(context: UserContext, role: UserRole): void {
  if (context.role !== role) {
    throw new ForbiddenError();
  }
}

export function ensureTrainee(context: UserContext): void {
  ensureRole(context, 'trainee');
}

export function ensureTrainer(context: UserContext): void {
  ensureRole(context, 'trainer');
}
