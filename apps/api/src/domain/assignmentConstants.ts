import { QUEST_STATUS } from './constants.js';
import type { Assignment } from './assignmentTypes.js';
import { DEFAULT_TRAINEE_ID, DEFAULT_TRAINER_ID } from './userIds.js';

export const SEED_ASSIGNMENTS: Assignment[] = [
  {
    id: 'quest-a',
    traineeId: DEFAULT_TRAINEE_ID,
    createdBy: DEFAULT_TRAINER_ID,
    majorItem: '開発基礎',
    title: 'クエストA',
    description: '',
    achievementLevel: 'Lv1',
    status: QUEST_STATUS.NOT_CLEARED,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];
