import type {
  ConditionDraft,
  ConditionHistoryRecord,
} from '../domain/conditionTypes.js';
import { InMemoryConditionRecordStore } from '../repositories/inMemoryConditionRecordStore.js';
import type { ConditionRecordStore } from '../repositories/conditionRecordStore.js';
import { invokeConditionRoute } from './conditionRouteTestHelpers.js';

export const TRAINEE_USER_ID = 'trainee-1';
export const TRAINER_USER_ID = 'trainer-1';
export const CONDITION_INVALID_VALUE_ERROR_NAME = 'ConditionInvalidValueError';

export const U_C06_INPUT_DRAFT: ConditionDraft = {
  workload: 2,
  comprehension: 4,
  mental: 5,
};

export const U_C03_HISTORY_RECORDS: ConditionHistoryRecord[] = [
  {
    recordedAt: '2026-03-01',
    workload: 3,
    comprehension: 3,
    mental: 3,
  },
  {
    recordedAt: '2026-03-08',
    workload: 4,
    comprehension: 3,
    mental: 2,
  },
  {
    recordedAt: '2026-03-15',
    workload: 4,
    comprehension: 2,
    mental: 1,
  },
];

export const U_C03_EXPECTED_TABLE_ROWS = U_C03_HISTORY_RECORDS.map(
  ({ recordedAt, workload, comprehension, mental }) => ({
    recordedAt,
    workload,
    comprehension,
    mental,
  }),
);

export const U_C03_EXPECTED_LINE_CHART = {
  xAxisLabels: ['2026-03-01', '2026-03-08', '2026-03-15'],
  yAxisMin: 1,
  yAxisMax: 5,
  series: [
    { key: 'workload', label: '業務量', values: [3, 4, 4] },
    { key: 'comprehension', label: '理解度', values: [3, 3, 2] },
    { key: 'mental', label: 'メンタル', values: [3, 2, 1] },
  ],
} as const;

export function createInMemoryConditionStore(): InMemoryConditionRecordStore {
  return new InMemoryConditionRecordStore();
}

export function expectConditionDraftValues(
  actual: ConditionDraft,
  expected: ConditionDraft,
): void {
  expect(actual.workload).toBe(expected.workload);
  expect(actual.comprehension).toBe(expected.comprehension);
  expect(actual.mental).toBe(expected.mental);
}

const TRAINEE_HEADERS = {
  'x-user-id': TRAINEE_USER_ID,
  'x-user-role': 'trainee',
} as const;

const TRAINER_HEADERS = {
  'x-user-id': TRAINER_USER_ID,
  'x-user-role': 'trainer',
} as const;

export async function postCondition(
  body: unknown,
  conditionRecordStore: ConditionRecordStore,
  headers: Record<string, string> = TRAINEE_HEADERS,
): Promise<{ statusCode: number; body: unknown }> {
  return invokeConditionRoute(conditionRecordStore, {
    method: 'post',
    path: '/condition',
    body,
    headers,
  });
}

export async function getConditionGraph(
  traineeId: string,
  conditionRecordStore: ConditionRecordStore,
  headers: Record<string, string> = TRAINER_HEADERS,
): Promise<{ statusCode: number; body: unknown }> {
  return invokeConditionRoute(conditionRecordStore, {
    method: 'get',
    path: '/condition/trainees/:traineeId/graph',
    params: { traineeId },
    headers,
  });
}

export async function getConditionAlerts(
  conditionRecordStore: ConditionRecordStore,
  headers: Record<string, string> = TRAINER_HEADERS,
): Promise<{ statusCode: number; body: unknown }> {
  return invokeConditionRoute(conditionRecordStore, {
    method: 'get',
    path: '/condition/alerts',
    headers,
  });
}

export async function getConditionPageAlert(
  traineeId: string,
  conditionRecordStore: ConditionRecordStore,
  headers: Record<string, string> = TRAINER_HEADERS,
): Promise<{ statusCode: number; body: unknown }> {
  return invokeConditionRoute(conditionRecordStore, {
    method: 'get',
    path: '/condition/trainees/:traineeId/page-alert',
    params: { traineeId },
    headers,
  });
}
