import type { ConditionDraft } from './conditionTypes.js';

export const CONDITION_DEFAULT_VALUE = 3;

export const CONDITION_SUBMIT_MESSAGE = '記録しました';

export const CONDITION_ALERT_THRESHOLD = 1;

export const CONDITION_ALERT_MESSAGE = '要フォロー';

export const MONITORED_TRAINEE_IDS = ['trainee-1'] as const;

export const CONDITION_FIELD = {
  WORKLOAD: 'workload',
  COMPREHENSION: 'comprehension',
  MENTAL: 'mental',
} as const satisfies Record<string, keyof ConditionDraft>;

export type ConditionField =
  (typeof CONDITION_FIELD)[keyof typeof CONDITION_FIELD];

export type MonitoredTraineeId = (typeof MONITORED_TRAINEE_IDS)[number];
