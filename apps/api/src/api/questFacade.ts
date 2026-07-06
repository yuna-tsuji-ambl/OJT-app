import type { Quest, UserRole } from '../domain/types.js';
import type { CreateQuestInput } from '../domain/questTypes.js';
import type { TrainerDashboard } from '../domain/trainerDashboardTypes.js';
import { toUserContext } from '../domain/userContext.js';
import type { QuestStore } from '../repositories/questStore.js';
import type { SheetRepository } from '../repositories/sheetRepository.js';
import { QuestService } from '../services/questService.js';
import { TrainerDashboardService } from '../services/trainerDashboardService.js';
import { TrainerQuestService } from '../services/trainerQuestService.js';

const questService = new QuestService();
const trainerQuestService = new TrainerQuestService();
const trainerDashboardService = new TrainerDashboardService();

export async function getQuestList(
  userId: string,
  role: UserRole,
  sheetRepository: SheetRepository,
  questStore?: QuestStore,
): Promise<Quest[]> {
  return questService.listQuests(
    toUserContext(userId, role),
    sheetRepository,
    questStore,
  );
}

export async function requestClearQuest(
  questId: string,
  userId: string,
  role: UserRole,
  questStore: QuestStore,
): Promise<Quest> {
  return questService.requestClear(
    questId,
    toUserContext(userId, role),
    questStore,
  );
}

export async function getPendingQuestList(
  userId: string,
  role: UserRole,
  questStore: QuestStore,
): Promise<Quest[]> {
  return trainerQuestService.listPendingQuests(
    toUserContext(userId, role),
    questStore,
  );
}

export async function approveQuest(
  questId: string,
  userId: string,
  role: UserRole,
  questStore: QuestStore,
  sheetRepository: SheetRepository,
): Promise<Quest> {
  return trainerQuestService.approve(
    questId,
    toUserContext(userId, role),
    questStore,
    sheetRepository,
  );
}

export function getTrainerDashboard(
  userId: string,
  role: UserRole,
): TrainerDashboard {
  return trainerDashboardService.getDashboard(toUserContext(userId, role));
}

export async function createQuest(
  userId: string,
  role: UserRole,
  input: CreateQuestInput,
  questStore: QuestStore,
): Promise<Quest> {
  return trainerQuestService.create(
    input,
    toUserContext(userId, role),
    questStore,
  );
}

export async function getTrainerQuestProgressList(
  userId: string,
  role: UserRole,
  questStore: QuestStore,
): Promise<Quest[]> {
  return trainerQuestService.listQuestProgress(
    toUserContext(userId, role),
    questStore,
  );
}
