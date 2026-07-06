export const TRAINER_STATUS = {
  QUEST_OK: '質問OK',
  FOCUS_MODE: '集中モード',
} as const;

export type TrainerStatusType =
  (typeof TRAINER_STATUS)[keyof typeof TRAINER_STATUS];

export const TRAINER_STATUSES = Object.values(TRAINER_STATUS);

export const DEFAULT_TRAINER_ID = 'trainer-1';
export const DEFAULT_TRAINEE_ID = 'trainee-1';

export const QUESTION_TEMPLATE = '〇〇の件で3分いいですか？';

export const REPLY_STAMPS = ['後で話そう'] as const;
