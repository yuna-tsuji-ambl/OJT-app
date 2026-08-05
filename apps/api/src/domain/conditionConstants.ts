import type { ConditionDraft } from './conditionTypes.js';
import type { ConditionTransitionTableColumn } from '@ojt-app/shared';

export const CONDITION_DEFAULT_VALUE = 3;

export const CONDITION_VALUE_MIN = 1;
export const CONDITION_VALUE_MAX = 5;

export const CONDITION_SUBMIT_MESSAGE = '記録しました';

export const CONDITION_ALERT_THRESHOLD = 1;

export const CONDITION_ALERT_MESSAGE = '要フォロー';

export const CONDITION_PAGE_ALERT_MESSAGE = '新卒が不安定です。';

export const MONITORED_TRAINEE_IDS = ['trainee-1'] as const;

export const CONDITION_FIELD = {
  WORKLOAD: 'workload',
  COMPREHENSION: 'comprehension',
  MENTAL: 'mental',
} as const satisfies Record<string, keyof ConditionDraft>;

export const CONDITION_DRAFT_FIELDS = [
  CONDITION_FIELD.WORKLOAD,
  CONDITION_FIELD.COMPREHENSION,
  CONDITION_FIELD.MENTAL,
] as const satisfies readonly (keyof ConditionDraft)[];

export const CONDITION_FIELD_LABELS = {
  [CONDITION_FIELD.WORKLOAD]: '業務量',
  [CONDITION_FIELD.COMPREHENSION]: '理解度',
  [CONDITION_FIELD.MENTAL]: 'メンタル',
} as const satisfies Record<keyof ConditionDraft, string>;

export const CONDITION_RECORDED_AT = {
  KEY: 'recordedAt',
  LABEL: '記録日時',
} as const;

export const CONDITION_TRANSITION_TABLE_COLUMNS = [
  {
    key: CONDITION_RECORDED_AT.KEY,
    label: CONDITION_RECORDED_AT.LABEL,
  },
  ...CONDITION_DRAFT_FIELDS.map((key) => ({
    key,
    label: CONDITION_FIELD_LABELS[key],
  })),
] as const satisfies readonly ConditionTransitionTableColumn[];

export type ConditionField =
  (typeof CONDITION_FIELD)[keyof typeof CONDITION_FIELD];

export type MonitoredTraineeId = (typeof MONITORED_TRAINEE_IDS)[number];
