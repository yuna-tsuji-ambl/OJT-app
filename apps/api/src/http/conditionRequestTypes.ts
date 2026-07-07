import type { ConditionDraft } from '../domain/conditionTypes.js';
import { CONDITION_FIELD } from '../domain/conditionConstants.js';

const CONDITION_VALUE_MIN = 1;
const CONDITION_VALUE_MAX = 5;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readConditionValue(
  body: Record<string, unknown>,
  field: keyof ConditionDraft,
): number | null {
  const value = body[field];

  if (typeof value !== 'number' || !Number.isInteger(value)) {
    return null;
  }

  if (value < CONDITION_VALUE_MIN || value > CONDITION_VALUE_MAX) {
    return null;
  }

  return value;
}

export function parseConditionDraftBody(body: unknown): ConditionDraft | null {
  if (!isRecord(body)) {
    return null;
  }

  const workload = readConditionValue(body, CONDITION_FIELD.WORKLOAD);
  const comprehension = readConditionValue(body, CONDITION_FIELD.COMPREHENSION);
  const mental = readConditionValue(body, CONDITION_FIELD.MENTAL);

  if (workload === null || comprehension === null || mental === null) {
    return null;
  }

  return { workload, comprehension, mental };
}
