import { ensureTrainer } from '../domain/authorization.js';
import { ForbiddenError } from '../domain/errors.js';
import { DEFAULT_TRAINEE_ID } from '../domain/userIds.js';
import { isTrainerAssignedToTrainee } from '../domain/traineeTrainerAssignment.js';
import type { UserContext } from '../domain/types.js';
import type { Goal } from './goalTypes.js';

function ensureAccess(allowed: boolean): void {
  if (!allowed) {
    throw new ForbiddenError();
  }
}

export function isGoalOwner(context: UserContext, traineeId: string): boolean {
  return context.role === 'trainee' && context.userId === traineeId;
}

export function isAssignedTrainerForTrainee(
  context: UserContext,
  traineeId: string,
): boolean {
  return (
    context.role === 'trainer' &&
    isTrainerAssignedToTrainee(context.userId, traineeId)
  );
}

export function canAccessGoal(context: UserContext, goal: Goal): boolean {
  return (
    isGoalOwner(context, goal.traineeId) ||
    isAssignedTrainerForTrainee(context, goal.traineeId)
  );
}

export function ensureGoalAccess(context: UserContext, goal: Goal): void {
  ensureAccess(canAccessGoal(context, goal));
}

export function ensureTrainerCanDeleteGoal(
  context: UserContext,
  goal: Goal,
): void {
  ensureTrainer(context);
  ensureAccess(isAssignedTrainerForTrainee(context, goal.traineeId));
}

export function resolveListTraineeId(
  context: UserContext,
  traineeId: string | undefined,
): string {
  if (context.role === 'trainee') {
    const resolved = traineeId ?? context.userId;
    ensureAccess(resolved === context.userId);
    return resolved;
  }

  const resolved = traineeId ?? DEFAULT_TRAINEE_ID;
  ensureAccess(isAssignedTrainerForTrainee(context, resolved));
  return resolved;
}

export function resolveCreateTraineeId(
  context: UserContext,
  traineeId: string | undefined,
): string {
  if (context.role === 'trainee') {
    const resolved = traineeId ?? context.userId;
    ensureAccess(resolved === context.userId);
    return resolved;
  }

  const resolved = traineeId ?? DEFAULT_TRAINEE_ID;
  ensureAccess(isAssignedTrainerForTrainee(context, resolved));
  return resolved;
}
