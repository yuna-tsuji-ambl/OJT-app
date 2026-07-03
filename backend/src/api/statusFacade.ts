import type { TrainerStatusType } from '../domain/statusConstants.js';
import type { TrainerStatusRecord } from '../domain/statusTypes.js';
import type { UserRole } from '../domain/types.js';
import { toUserContext } from '../domain/userContext.js';
import type { TrainerStatusStore } from '../repositories/trainerStatusStore.js';
import { StatusService } from '../services/statusService.js';

const statusService = new StatusService();

export async function updateTrainerStatus(
  status: TrainerStatusType,
  userId: string,
  role: UserRole,
  trainerStatusStore: TrainerStatusStore,
): Promise<TrainerStatusRecord> {
  return statusService.updateTrainerStatus(
    status,
    toUserContext(userId, role),
    trainerStatusStore,
  );
}
