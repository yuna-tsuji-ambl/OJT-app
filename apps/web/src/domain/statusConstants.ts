export const TRAINER_STATUS = {
  QUEST_OK: '質問OK',
  FOCUS_MODE: '集中モード',
} as const;

export type TrainerStatusType =
  (typeof TRAINER_STATUS)[keyof typeof TRAINER_STATUS];

export const TRAINER_STATUSES = Object.values(TRAINER_STATUS);

export { DEFAULT_TRAINER_ID, DEFAULT_TRAINEE_ID } from './participantConstants';
