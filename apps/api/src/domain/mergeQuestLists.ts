import type { Quest } from './types.js';

export function mergeQuestLists(
  sheetQuests: Quest[],
  storeQuests: Quest[],
): Quest[] {
  return [...sheetQuests, ...storeQuests];
}
