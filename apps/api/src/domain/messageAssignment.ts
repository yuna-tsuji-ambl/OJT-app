import { ensureTrainee } from './authorization.js';
import { ForbiddenError } from './errors.js';
import { isTrainerAssignedToTrainee } from './traineeTrainerAssignment.js';
import type { UserContext } from './types.js';

export { resolveAssignedTrainerId } from './traineeTrainerAssignment.js';

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
  if (!isTrainerAssignedToTrainee(trainerId, traineeId)) {
    throw new ForbiddenError();
  }
}
