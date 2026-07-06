import type { Quest } from '../domain/types.js';

export interface SheetRepository {
  loadQuests(assigneeId: string): Promise<Quest[]>;
  updateOnApproval(quest: Quest): Promise<void>;
}
