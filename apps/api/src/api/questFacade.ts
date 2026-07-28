import type { CreateQuestInput } from '../domain/questTypes.js';
import type { Quest, UserRole } from '../domain/types.js';
import { toUserContext } from '../domain/userContext.js';
import type { AssignmentRepository } from '../repositories/assignmentRepository.js';
import { AssignmentService } from '../services/assignmentService.js';

const assignmentService = new AssignmentService();

export async function getQuestList(
  userId: string,
  role: UserRole,
  assignmentRepository: AssignmentRepository,
): Promise<Quest[]> {
  return assignmentService.listForTrainee(
    toUserContext(userId, role),
    assignmentRepository,
  );
}

export async function requestClearQuest(
  questId: string,
  userId: string,
  role: UserRole,
  assignmentRepository: AssignmentRepository,
): Promise<Quest> {
  return assignmentService.requestClear(
    questId,
    toUserContext(userId, role),
    assignmentRepository,
  );
}

export async function getPendingQuestList(
  userId: string,
  role: UserRole,
  assignmentRepository: AssignmentRepository,
): Promise<Quest[]> {
  return assignmentService.listPending(
    toUserContext(userId, role),
    assignmentRepository,
  );
}

export async function approveQuest(
  questId: string,
  userId: string,
  role: UserRole,
  assignmentRepository: AssignmentRepository,
): Promise<Quest> {
  return assignmentService.approve(
    questId,
    toUserContext(userId, role),
    assignmentRepository,
  );
}

export async function createQuest(
  userId: string,
  role: UserRole,
  input: CreateQuestInput,
  assignmentRepository: AssignmentRepository,
): Promise<Quest> {
  return assignmentService.createFromQuestInput(
    input,
    toUserContext(userId, role),
    assignmentRepository,
  );
}

export async function getTrainerQuestProgressList(
  userId: string,
  role: UserRole,
  assignmentRepository: AssignmentRepository,
): Promise<Quest[]> {
  return assignmentService.listTrainerProgress(
    toUserContext(userId, role),
    assignmentRepository,
  );
}

export { getTrainerDashboard } from './trainerDashboardFacade.js';
