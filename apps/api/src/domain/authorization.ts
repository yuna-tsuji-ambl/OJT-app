import { ForbiddenError } from './errors.js';
import type { MessageThread } from './messageTypes.js';
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

export function ensureConversationParticipant(
  context: UserContext,
  trainerId: string,
  traineeId: string,
): void {
  const isParticipant =
    context.userId === trainerId || context.userId === traineeId;

  if (!isParticipant) {
    throw new ForbiddenError();
  }
}

export function ensureThreadParticipants(
  thread: MessageThread,
  trainerId: string,
  traineeId: string,
): void {
  if (thread.trainerId !== trainerId || thread.traineeId !== traineeId) {
    throw new ForbiddenError();
  }
}
