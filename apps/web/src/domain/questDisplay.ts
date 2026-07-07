import type { Quest } from '@ojt-app/shared';

export const QUEST_CLEARED_LABEL = 'クリア（承認済み）' as const;

const QUEST_STATUS = {
  NOT_CLEARED: '未クリア',
  PENDING: '申請中',
  CLEARED: 'クリア',
} as const;

export function formatQuestStatus(quest: Quest): string {
  if (quest.status === QUEST_STATUS.CLEARED) {
    return QUEST_CLEARED_LABEL;
  }

  if (quest.status === QUEST_STATUS.PENDING) {
    return QUEST_STATUS.PENDING;
  }

  return QUEST_STATUS.NOT_CLEARED;
}

export function isQuestCleared(quest: Quest): boolean {
  return quest.status === QUEST_STATUS.CLEARED;
}

export function canRequestQuestClear(quest: Quest): boolean {
  return (
    quest.status === undefined || quest.status === QUEST_STATUS.NOT_CLEARED
  );
}
