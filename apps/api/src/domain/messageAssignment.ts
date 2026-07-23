import { ensureTrainee } from './authorization.js';
import { ForbiddenError } from './errors.js';
import type { UserContext } from './types.js';
import { DEFAULT_TRAINEE_ID, DEFAULT_TRAINER_ID } from './userIds.js';

const ASSIGNED_TRAINER_ID_BY_TRAINEE_ID: Readonly<Record<string, string>> = {
  [DEFAULT_TRAINEE_ID]: DEFAULT_TRAINER_ID,
};

export function resolveAssignedTrainerId(
  traineeId: string,
): string | undefined {
  return ASSIGNED_TRAINER_ID_BY_TRAINEE_ID[traineeId];
}

export function ensureTraineeCanSendMessage(
  context: UserContext,
  trainerId: string,
): void {
  ensureTrainee(context);
  ensureTraineeAssignedTrainer(context.userId, trainerId);
}

function ensureTraineeAssignedTrainer(
  traineeId: string,
  trainerId: string,
): void {
  if (resolveAssignedTrainerId(traineeId) !== trainerId) {
    throw new ForbiddenError();
  }
}
