import type { Quest } from '../domain/types.js';
import type { QuestStore } from './questStore.js';
import type { QuestMemory } from './questMemory.js';

export class InMemoryQuestStore implements QuestStore {
  constructor(private readonly memory: QuestMemory) {}

  async getById(id: string): Promise<Quest | null> {
    return this.memory.findById(id) ?? null;
  }

  async update(quest: Quest): Promise<void> {
    this.memory.save(quest);
  }

  async getPendingQuests(): Promise<Quest[]> {
    return this.memory.findPending();
  }
}
