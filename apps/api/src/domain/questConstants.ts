import { QUEST_STATUS } from './constants.js';
import type { Quest } from './types.js';

export const SEED_QUESTS: Quest[] = [
  {
    id: 'quest-a',
    majorItem: '開発基礎',
    minorItem: 'クエストA',
    achievementLevel: 'Lv1',
    status: QUEST_STATUS.NOT_CLEARED,
  },
];
