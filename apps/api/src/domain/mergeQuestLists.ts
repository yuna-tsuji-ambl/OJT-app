import type { Quest } from './types.js';

export function mergeQuestLists(
  sheetQuests: Quest[],
  storeQuests: Quest[],
): Quest[] {
  const questsById = new Map<string, Quest>();

  for (const quest of sheetQuests) {
    questsById.set(quest.id, quest);
  }

  for (const quest of storeQuests) {
    questsById.set(quest.id, quest);
  }

  return [...questsById.values()];
}
