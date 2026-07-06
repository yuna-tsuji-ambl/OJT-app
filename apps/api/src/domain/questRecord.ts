import { QuestNotFoundError } from './errors.js';
import type { Quest } from './types.js';

export function requireQuest(
  questId: string,
  quest: Quest | null | undefined,
): Quest {
  if (!quest) {
    throw new QuestNotFoundError(questId);
  }
  return quest;
}
