import {
  CONDITION_ALERT_MESSAGE,
  CONDITION_ALERT_THRESHOLD,
  CONDITION_DEFAULT_VALUE,
} from './conditionConstants.js';
import { getLatestHistoryRecord } from './conditionHistory.js';
import type {
  ConditionAlert,
  ConditionHistoryRecord,
} from './conditionTypes.js';

export function isMentalAlertThreshold(mental: number): boolean {
  return mental === CONDITION_ALERT_THRESHOLD;
}

export function buildConditionAlert(
  traineeId: string,
  records: ConditionHistoryRecord[],
): ConditionAlert {
  const latest = getLatestHistoryRecord(records);
  const latestMental = latest?.mental ?? CONDITION_DEFAULT_VALUE;
  const hasAlert = isMentalAlertThreshold(latestMental);

  return {
    traineeId,
    hasAlert,
    message: hasAlert ? CONDITION_ALERT_MESSAGE : '',
    latestMental,
  };
}
