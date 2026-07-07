import { QUEST_STATUS } from '../domain/constants.js';
import { ensureTrainee } from '../domain/authorization.js';
import { mergeQuestLists } from '../domain/mergeQuestLists.js';
import { requireQuest } from '../domain/questRecord.js';
import { withQuestStatus } from '../domain/questStatus.js';
import type { Quest, UserContext } from '../domain/types.js';
import type { QuestStore } from '../repositories/questStore.js';
import type { SheetRepository } from '../repositories/sheetRepository.js';

export class QuestService {
  async listQuests(
    context: UserContext,
    sheetRepository: SheetRepository,
    questStore?: QuestStore,
  ): Promise<Quest[]> {
    const sheetQuests = await sheetRepository.loadQuests(context.userId);

    if (!questStore) {
      return sheetQuests;
    }

    ensureTrainee(context);
    const storeQuests = await questStore.listAllQuests();
    return mergeQuestLists(sheetQuests, storeQuests);
  }

  async requestClear(
    questId: string,
    context: UserContext,
    questStore: QuestStore,
  ): Promise<Quest> {
    ensureTrainee(context);

    const quest = requireQuest(questId, await questStore.getById(questId));
    const updated = withQuestStatus(quest, QUEST_STATUS.PENDING);
    await questStore.update(updated);
    return updated;
  }
}
