import { ACHIEVEMENT_LEVEL_MAX, ACHIEVEMENT_LEVEL_MIN } from '@ojt-app/shared';
import type { CreateQuestInput } from './questTypes.js';

export const ACHIEVEMENT_LEVEL_LABEL_PATTERN = /^Lv\d+$/;

export function isFormattedAchievementLevel(level: string): boolean {
  return ACHIEVEMENT_LEVEL_LABEL_PATTERN.test(level);
}

export function normalizeAchievementLevel(level: string): string {
  if (/^\d+$/.test(level)) {
    const numericLevel = Number(level);

    if (
      Number.isInteger(numericLevel) &&
      numericLevel >= ACHIEVEMENT_LEVEL_MIN &&
      numericLevel <= ACHIEVEMENT_LEVEL_MAX
    ) {
      return `Lv${numericLevel}`;
    }
  }

  return level;
}

export function normalizeCreateQuestInput(
  input: CreateQuestInput,
): CreateQuestInput {
  return {
    ...input,
    achievementLevel: normalizeAchievementLevel(input.achievementLevel),
  };
}
