import type { Quest } from '../domain/types.js';

export interface QuestStore {
  getById(id: string): Promise<Quest | null>;
  update(quest: Quest): Promise<void>;
  getPendingQuests(): Promise<Quest[]>;
}
