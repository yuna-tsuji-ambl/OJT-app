export type {
  Quest,
  QuestStatus,
  UserContext,
  UserRole,
} from './domain/types.js';
export type { AssignmentRepository } from './repositories/assignmentRepository.js';
export type { CreateQuestInput } from './domain/questTypes.js';
export {
  TRAINER_DASHBOARD_SECTION_POSITION,
  TRAINER_DASHBOARD_SECTION_TYPE,
} from './domain/trainerDashboardConstants.js';
export type {
  TrainerDashboard,
  TrainerDashboardSection,
} from './domain/trainerDashboardTypes.js';
export { AssignmentService } from './services/assignmentService.js';
export { TrainerDashboardService } from './services/trainerDashboardService.js';
export { SEED_ASSIGNMENTS } from './domain/assignmentConstants.js';

export {
  approveQuest,
  createQuest,
  getPendingQuestList,
  getQuestList,
  getTrainerDashboard,
  getTrainerQuestProgressList,
  requestClearQuest,
} from './api/questFacade.js';
