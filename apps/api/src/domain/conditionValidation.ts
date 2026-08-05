import {
  CONDITION_DRAFT_FIELDS,
  CONDITION_VALUE_MAX,
  CONDITION_VALUE_MIN,
} from './conditionConstants.js';
import { ConditionInvalidValueError } from './errors.js';
import type { ConditionDraft } from './conditionTypes.js';

export function isValidConditionValue(value: number): boolean {
  return (
    Number.isInteger(value) &&
    value >= CONDITION_VALUE_MIN &&
    value <= CONDITION_VALUE_MAX
  );
}

export function validateConditionDraft(draft: ConditionDraft): ConditionDraft {
  for (const field of CONDITION_DRAFT_FIELDS) {
    if (!isValidConditionValue(draft[field])) {
      throw new ConditionInvalidValueError();
    }
  }

  return draft;
}
