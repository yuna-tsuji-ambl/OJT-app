import { TrainerStatusNotFoundError } from './errors.js';
import type { TrainerStatusRecord } from './statusTypes.js';
import type { TrainerStatusType } from './statusConstants.js';

export function createTrainerStatusRecord(
  userId: string,
  status: TrainerStatusType,
): TrainerStatusRecord {
  return { userId, status };
}

export function requireTrainerStatusRecord(
  trainerId: string,
  record: TrainerStatusRecord | null,
): TrainerStatusRecord {
  if (!record) {
    throw new TrainerStatusNotFoundError(trainerId);
  }
  return record;
}
