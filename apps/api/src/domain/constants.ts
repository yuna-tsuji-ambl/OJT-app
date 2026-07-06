import type { QuestStatus } from './types.js';

export const QUEST_STATUS = {
  NOT_CLEARED: '未クリア',
  PENDING: '申請中',
  CLEARED: 'クリア',
} as const satisfies Record<string, QuestStatus>;
