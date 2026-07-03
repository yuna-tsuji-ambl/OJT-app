import type { Quest, UserRole } from '../domain/types.js';
import { toUserContext } from '../domain/userContext.js';
import type { QuestStore } from '../repositories/questStore.js';
import type { SheetRepository } from '../repositories/sheetRepository.js';
import { QuestService } from '../services/questService.js';

const questService = new QuestService();

export async function getQuestList(
  userId: string,
  role: UserRole,
  sheetRepository: SheetRepository,
): Promise<Quest[]> {
  return questService.listQuests(toUserContext(userId, role), sheetRepository);
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
  return questService.listPendingQuests(
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
  return questService.approve(
    questId,
    toUserContext(userId, role),
    questStore,
    sheetRepository,
  );
}
