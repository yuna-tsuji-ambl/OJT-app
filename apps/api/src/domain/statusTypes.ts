import type { TrainerStatusType } from './statusConstants.js';

export interface TrainerStatusRecord {
  userId: string;
  status: TrainerStatusType;
}
