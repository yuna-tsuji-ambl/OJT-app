import { ensureTrainer } from '../domain/authorization.js';
import { QUEST_STATUS } from '../domain/constants.js';
import { requireQuest } from '../domain/questRecord.js';
import { withQuestStatus } from '../domain/questStatus.js';
import type { CreateQuestInput } from '../domain/questTypes.js';
import type { Quest, UserContext } from '../domain/types.js';
import type { QuestStore } from '../repositories/questStore.js';
import type { SheetRepository } from '../repositories/sheetRepository.js';

export class TrainerQuestService {
  async create(
    input: CreateQuestInput,
    context: UserContext,
    questStore: QuestStore,
  ): Promise<Quest> {
    ensureTrainer(context);
    return questStore.create(input);
  }

  async listQuestProgress(
    context: UserContext,
    questStore: QuestStore,
  ): Promise<Quest[]> {
    ensureTrainer(context);
    return questStore.listAllQuests();
  }

  async listPendingQuests(
    context: UserContext,
    questStore: QuestStore,
  ): Promise<Quest[]> {
    ensureTrainer(context);
    return questStore.getPendingQuests();
  }

  async approve(
    questId: string,
    context: UserContext,
    questStore: QuestStore,
    sheetRepository: SheetRepository,
  ): Promise<Quest> {
    ensureTrainer(context);

    const quest = requireQuest(questId, await questStore.getById(questId));
    const updated = withQuestStatus(quest, QUEST_STATUS.CLEARED);
    await questStore.update(updated);
    await sheetRepository.updateOnApproval(updated);
    return updated;
  }
}
