import type { TrainerStatusRecord } from './statusTypes.js';
import type { TrainerStatusType } from './statusConstants.js';

export function createTrainerStatusRecord(
  userId: string,
  status: TrainerStatusType,
): TrainerStatusRecord {
  return { userId, status };
}
