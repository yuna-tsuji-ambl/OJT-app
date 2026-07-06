import { SEED_QUESTS } from '../domain/questConstants.js';
import type { QuestStore } from './questStore.js';
import type { SheetRepository } from './sheetRepository.js';
import { InMemoryQuestStore } from './inMemoryQuestStore.js';
import { InMemorySheetRepository } from './inMemorySheetRepository.js';
import { QuestMemory } from './questMemory.js';

export interface QuestPersistence {
  questStore: QuestStore;
  sheetRepository: SheetRepository;
}

export function createInMemoryQuestPersistence(): QuestPersistence {
  const memory = new QuestMemory(SEED_QUESTS);

  return {
    questStore: new InMemoryQuestStore(memory),
    sheetRepository: new InMemorySheetRepository(memory),
  };
}
