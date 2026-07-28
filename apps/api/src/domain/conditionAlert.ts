import {
  CONDITION_ALERT_MESSAGE,
  CONDITION_PAGE_ALERT_MESSAGE,
  CONDITION_ALERT_THRESHOLD,
  CONDITION_DEFAULT_VALUE,
  CONDITION_DRAFT_FIELDS,
} from './conditionConstants.js';
import { getLatestHistoryRecord } from './conditionHistory.js';
import type {
  ConditionAlert,
  ConditionAlertMessage,
  ConditionDraft,
  ConditionHistoryRecord,
  ConditionPageAlert,
  LatestConditionAlertState,
} from './conditionTypes.js';

export function isConditionAlertValue(value: number): boolean {
  return value === CONDITION_ALERT_THRESHOLD;
}

export function hasConditionAlertDraft(draft: ConditionDraft): boolean {
  return CONDITION_DRAFT_FIELDS.some((field) =>
    isConditionAlertValue(draft[field]),
  );
}

function resolveLatestAlertState(
  records: ConditionHistoryRecord[],
): LatestConditionAlertState {
  const latest = getLatestHistoryRecord(records);

  return {
    latest,
    hasAlert: latest !== null && hasConditionAlertDraft(latest),
  };
}

function resolveAlertMessage(hasAlert: boolean, alertMessage: string): string {
  return hasAlert ? alertMessage : '';
}

function buildConditionAlertMessage(
  state: LatestConditionAlertState,
  alertMessage: string,
): ConditionAlertMessage {
  return {
    hasAlert: state.hasAlert,
    message: resolveAlertMessage(state.hasAlert, alertMessage),
  };
}

export function buildConditionAlert(
  traineeId: string,
  records: ConditionHistoryRecord[],
): ConditionAlert {
  const state = resolveLatestAlertState(records);

  return {
    traineeId,
    ...buildConditionAlertMessage(state, CONDITION_ALERT_MESSAGE),
    latestMental: state.latest?.mental ?? CONDITION_DEFAULT_VALUE,
  };
}

export function buildConditionPageAlert(
  records: ConditionHistoryRecord[],
): ConditionPageAlert {
  return buildConditionAlertMessage(
    resolveLatestAlertState(records),
    CONDITION_PAGE_ALERT_MESSAGE,
  );
}
