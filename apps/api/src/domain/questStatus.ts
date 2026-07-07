import type { Quest, QuestStatus } from './types.js';

export function withQuestStatus(quest: Quest, status: QuestStatus): Quest {
  return { ...quest, status };
}
