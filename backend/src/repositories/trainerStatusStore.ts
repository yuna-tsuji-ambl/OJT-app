import type { TrainerStatusType } from '../domain/statusConstants.js';
import type { TrainerStatusRecord } from '../domain/statusTypes.js';

export interface TrainerStatusStore {
  getByUserId(userId: string): Promise<TrainerStatusRecord | null>;
  update(userId: string, status: TrainerStatusType): Promise<void>;
}
