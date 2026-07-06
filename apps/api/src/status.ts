export type { TrainerStatusRecord } from './domain/statusTypes.js';
export type { TrainerStatusType } from './domain/statusConstants.js';
export { TRAINER_STATUS } from './domain/statusConstants.js';
export type { TrainerStatusStore } from './repositories/trainerStatusStore.js';
export { StatusService } from './services/statusService.js';

export { updateTrainerStatus } from './api/statusFacade.js';
