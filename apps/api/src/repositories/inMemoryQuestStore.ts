import { createQuestFromInput } from '../domain/createQuest.js';
import type { Quest } from '../domain/types.js';
import type { CreateQuestInput } from '../domain/questTypes.js';
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

  async create(input: CreateQuestInput): Promise<Quest> {
    const quest = createQuestFromInput(input);
    this.memory.save(quest);
    return quest;
  }

  async listAllQuests(): Promise<Quest[]> {
    return this.memory.findAll();
  }
}
