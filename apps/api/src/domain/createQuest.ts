import { normalizeCreateQuestInput } from './achievementLevel.js';
import { QUEST_STATUS } from './constants.js';
import type { CreateQuestInput } from './questTypes.js';
import type { Quest } from './types.js';

export function buildNewQuest(id: string, input: CreateQuestInput): Quest {
  return {
    id,
    majorItem: input.majorItem,
    minorItem: input.minorItem,
    achievementLevel: input.achievementLevel,
    status: QUEST_STATUS.NOT_CLEARED,
  };
}

export function createQuestFromInput(input: CreateQuestInput): Quest {
  return buildNewQuest(crypto.randomUUID(), normalizeCreateQuestInput(input));
}
