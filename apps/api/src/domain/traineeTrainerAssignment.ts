import { DEFAULT_TRAINEE_ID, DEFAULT_TRAINER_ID } from './userIds.js';

const ASSIGNED_TRAINER_ID_BY_TRAINEE_ID: Readonly<Record<string, string>> = {
  [DEFAULT_TRAINEE_ID]: DEFAULT_TRAINER_ID,
};

export function resolveAssignedTrainerId(
  traineeId: string,
): string | undefined {
  return ASSIGNED_TRAINER_ID_BY_TRAINEE_ID[traineeId];
}

export function isTrainerAssignedToTrainee(
  trainerId: string,
  traineeId: string,
): boolean {
  return resolveAssignedTrainerId(traineeId) === trainerId;
}
