import type { UserContext, UserRole } from '../domain/types.js';
import { toUserContext } from '../domain/userContext.js';
import type { ConditionRecordStore } from '../repositories/conditionRecordStore.js';

export type ConditionStoreHandler<T> = (
  context: UserContext,
  conditionRecordStore: ConditionRecordStore,
) => Promise<T>;

export type TrainerTraineeStoreHandler<T> = (
  traineeId: string,
  context: UserContext,
  conditionRecordStore: ConditionRecordStore,
) => Promise<T>;

export type WithConditionContextHandler<T> = (context: UserContext) => T;

export function withConditionContext<T>(
  userId: string,
  role: UserRole,
  handler: WithConditionContextHandler<T>,
): T {
  return handler(toUserContext(userId, role));
}

export async function withConditionStore<T>(
  userId: string,
  role: UserRole,
  conditionRecordStore: ConditionRecordStore,
  handler: ConditionStoreHandler<T>,
): Promise<T> {
  return handler(toUserContext(userId, role), conditionRecordStore);
}

export async function withTrainerTraineeStore<T>(
  traineeId: string,
  userId: string,
  role: UserRole,
  conditionRecordStore: ConditionRecordStore,
  handler: TrainerTraineeStoreHandler<T>,
): Promise<T> {
  return withConditionStore(
    userId,
    role,
    conditionRecordStore,
    (context, store) => handler(traineeId, context, store),
  );
}
