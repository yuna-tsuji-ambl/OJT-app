import type { Request, Response } from 'express';
import type { ConditionDraft } from '../domain/conditionTypes.js';
import { InMemoryConditionRecordStore } from '../repositories/inMemoryConditionRecordStore.js';
import type { ConditionRecordStore } from '../repositories/conditionRecordStore.js';
import { createConditionRouter } from '../routes/conditionRoutes.js';

export const TRAINEE_USER_ID = 'trainee-1';
export const TRAINER_USER_ID = 'trainer-1';
export const CONDITION_INVALID_VALUE_ERROR_NAME = 'ConditionInvalidValueError';

export const U_C06_INPUT_DRAFT: ConditionDraft = {
  workload: 2,
  comprehension: 4,
  mental: 5,
};

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

export function postCondition(
  body: unknown,
  conditionRecordStore: ConditionRecordStore,
  headers: Record<string, string> = {
    'x-user-id': 'trainee-1',
    'x-user-role': 'trainee',
  },
): { statusCode: number; body: unknown } {
  const router = createConditionRouter(conditionRecordStore);
  const routeLayer = router.stack.find(
    (layer) =>
      layer.route?.path === '/condition' && layer.route.methods.post === true,
  );
  const handler = routeLayer?.route?.stack[0]?.handle;

  if (!handler) {
    throw new Error('POST /condition handler not found');
  }

  const request = {
    body,
    header(name: string) {
      const normalizedName = name.toLowerCase();
      return headers[normalizedName] ?? headers[name] ?? undefined;
    },
    params: {},
  } as Request;

  let statusCode = 200;
  let responseBody: unknown;

  const response = {
    status(code: number) {
      statusCode = code;
      return this;
    },
    json(payload: unknown) {
      responseBody = payload;
      return this;
    },
  } as Response;

  handler(request, response, () => undefined);

  return { statusCode, body: responseBody };
}
