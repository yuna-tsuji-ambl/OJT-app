import { ensureTrainer } from '../domain/authorization.js';
import type { TrainerStatusType } from '../domain/statusConstants.js';
import type { TrainerStatusRecord } from '../domain/statusTypes.js';
import { createTrainerStatusRecord } from '../domain/trainerStatus.js';
import type { UserContext } from '../domain/types.js';
import type { TrainerStatusStore } from '../repositories/trainerStatusStore.js';

export class StatusService {
  async updateTrainerStatus(
    status: TrainerStatusType,
    context: UserContext,
    trainerStatusStore: TrainerStatusStore,
  ): Promise<TrainerStatusRecord> {
    ensureTrainer(context);

    await trainerStatusStore.update(context.userId, status);

    return createTrainerStatusRecord(context.userId, status);
  }
}
