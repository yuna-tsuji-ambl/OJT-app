import { QUEST_STATUS } from '../domain/constants.js';
import type { Quest } from '../domain/types.js';

export class QuestMemory {
  private readonly quests = new Map<string, Quest>();

  constructor(initialQuests: Quest[]) {
    for (const quest of initialQuests) {
      this.quests.set(quest.id, { ...quest });
    }
  }

  findById(id: string): Quest | undefined {
    const quest = this.quests.get(id);
    return quest ? { ...quest } : undefined;
  }

  save(quest: Quest): void {
    this.quests.set(quest.id, { ...quest });
  }

  findAll(): Quest[] {
    return [...this.quests.values()].map((quest) => ({ ...quest }));
  }

  findPending(): Quest[] {
    return this.findAll().filter(
      (quest) => quest.status === QUEST_STATUS.PENDING,
    );
  }
}
