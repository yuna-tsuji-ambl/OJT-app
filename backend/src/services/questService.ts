import { QUEST_STATUS } from '../domain/constants.js';
import { ensureTrainer, ensureTrainee } from '../domain/authorization.js';
import { QuestNotFoundError } from '../domain/errors.js';
import type { Quest, UserContext } from '../domain/types.js';
import type { QuestStore } from '../repositories/questStore.js';
import type { SheetRepository } from '../repositories/sheetRepository.js';

async function findQuestOrThrow(
  questId: string,
  questStore: QuestStore,
): Promise<Quest> {
  const quest = await questStore.getById(questId);
  if (!quest) {
    throw new QuestNotFoundError(questId);
  }
  return quest;
}

export class QuestService {
  async listQuests(
    context: UserContext,
    sheetRepository: SheetRepository,
  ): Promise<Quest[]> {
    return sheetRepository.loadQuests(context.userId);
  }

  async requestClear(
    questId: string,
    context: UserContext,
    questStore: QuestStore,
  ): Promise<Quest> {
    ensureTrainee(context);

    const quest = await findQuestOrThrow(questId, questStore);
    const updated: Quest = { ...quest, status: QUEST_STATUS.PENDING };
    await questStore.update(updated);
    return updated;
  }

  async listPendingQuests(
    context: UserContext,
    questStore: QuestStore,
  ): Promise<Quest[]> {
    ensureTrainer(context);

    const quests = await questStore.getPendingQuests();
    return quests.filter((quest) => quest.status === QUEST_STATUS.PENDING);
  }

  async approve(
    questId: string,
    context: UserContext,
    questStore: QuestStore,
    sheetRepository: SheetRepository,
  ): Promise<Quest> {
    ensureTrainer(context);

    const quest = await findQuestOrThrow(questId, questStore);
    const updated: Quest = { ...quest, status: QUEST_STATUS.CLEARED };
    await questStore.update(updated);
    await sheetRepository.updateOnApproval(updated);
    return updated;
  }
}
