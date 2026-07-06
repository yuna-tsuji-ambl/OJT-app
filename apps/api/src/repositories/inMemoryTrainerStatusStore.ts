import { TRAINER_STATUS } from '../domain/statusConstants.js';
import type { TrainerStatusType } from '../domain/statusConstants.js';
import type { TrainerStatusRecord } from '../domain/statusTypes.js';
import { DEFAULT_TRAINER_ID } from '../domain/userIds.js';
import type { TrainerStatusStore } from './trainerStatusStore.js';

export class InMemoryTrainerStatusStore implements TrainerStatusStore {
  private readonly statuses = new Map<string, TrainerStatusRecord>([
    [
      DEFAULT_TRAINER_ID,
      {
        userId: DEFAULT_TRAINER_ID,
        status: TRAINER_STATUS.FOCUS_MODE,
      },
    ],
  ]);

  async getByUserId(userId: string): Promise<TrainerStatusRecord | null> {
    const record = this.statuses.get(userId);
    return record ? { ...record } : null;
  }

  async update(userId: string, status: TrainerStatusType): Promise<void> {
    this.statuses.set(userId, { userId, status });
  }
}
