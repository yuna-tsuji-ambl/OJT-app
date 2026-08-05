import { CONDITION_DRAFT_FIELDS } from '../domain/conditionConstants.js';
import type { ConditionDraft } from '../domain/conditionTypes.js';
import { isValidConditionValue } from '../domain/conditionValidation.js';
import { isUnknownRecord } from './requestParsing.js';

function readConditionValue(
  body: Record<string, unknown>,
  field: keyof ConditionDraft,
): number | null {
  const value = body[field];

  if (typeof value !== 'number' || !isValidConditionValue(value)) {
    return null;
  }

  return value;
}

export function parseConditionDraftBody(body: unknown): ConditionDraft | null {
  if (!isUnknownRecord(body)) {
    return null;
  }

  const parsed = {} as ConditionDraft;

  for (const field of CONDITION_DRAFT_FIELDS) {
    const value = readConditionValue(body, field);

    if (value === null) {
      return null;
    }

    parsed[field] = value;
  }

  return parsed;
}
