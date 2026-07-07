import type { QuestStatus } from './types.js';

export const QUEST_STATUS = {
  NOT_CLEARED: '未クリア',
  PENDING: '申請中',
  CLEARED: 'クリア',
} as const satisfies Record<string, QuestStatus>;

export const ACHIEVEMENT_LEVEL_MIN = 1;
export const ACHIEVEMENT_LEVEL_MAX = 5;

export function buildAchievementLevelOptionValues(): readonly string[] {
  const options: string[] = [];

  for (
    let level = ACHIEVEMENT_LEVEL_MIN;
    level <= ACHIEVEMENT_LEVEL_MAX;
    level += 1
  ) {
    options.push(String(level));
  }

  return options;
}
