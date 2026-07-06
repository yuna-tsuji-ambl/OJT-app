import {
  CONDITION_SUBMIT_MESSAGE,
  type ConditionField,
} from './conditionConstants.js';
import type {
  ConditionDraft,
  ConditionSubmitResult,
} from './conditionTypes.js';

export function cloneConditionDraft(values: ConditionDraft): ConditionDraft {
  return { ...values };
}

export function updateConditionDraftField(
  draft: ConditionDraft,
  field: ConditionField,
  value: number,
): ConditionDraft {
  return { ...draft, [field]: value };
}

export function createSubmitResult(
  record: ConditionDraft,
): ConditionSubmitResult {
  return {
    message: CONDITION_SUBMIT_MESSAGE,
    record,
  };
}
