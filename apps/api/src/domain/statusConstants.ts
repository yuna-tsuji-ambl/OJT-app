export const TRAINER_STATUS = {
  QUEST_OK: '質問OK',
  FOCUS_MODE: '集中モード',
} as const;

export type TrainerStatusType =
  (typeof TRAINER_STATUS)[keyof typeof TRAINER_STATUS];

export function isTrainerStatusType(value: string): value is TrainerStatusType {
  return (
    value === TRAINER_STATUS.QUEST_OK || value === TRAINER_STATUS.FOCUS_MODE
  );
}
