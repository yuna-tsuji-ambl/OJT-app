import type { Quest } from '../domain/types.js';
import type { SheetRepository } from './sheetRepository.js';
import type { QuestMemory } from './questMemory.js';

export class InMemorySheetRepository implements SheetRepository {
  constructor(private readonly memory: QuestMemory) {}

  async loadQuests(_assigneeId: string): Promise<Quest[]> {
    return this.memory.findAll();
  }

  async updateOnApproval(quest: Quest): Promise<void> {
    this.memory.save(quest);
  }
}
