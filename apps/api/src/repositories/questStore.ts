import type { Quest } from '../domain/types.js';
import type { CreateQuestInput } from '../domain/questTypes.js';

export interface QuestStore {
  getById(id: string): Promise<Quest | null>;
  update(quest: Quest): Promise<void>;
  getPendingQuests(): Promise<Quest[]>;
  create(input: CreateQuestInput): Promise<Quest>;
  listAllQuests(): Promise<Quest[]>;
}
