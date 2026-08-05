import { REPORT_TYPE, type ReportType } from './reportConstants.js';
import { assertValidReportInput } from './assertValidReportInput.js';
import { isValidDailyPeriodKey } from './reportDailyPeriodKey.js';
import { isValidWeeklyPeriodKey } from './reportWeeklyPeriodKey.js';

type PeriodKeyPredicate = (periodKey: string) => boolean;
type PeriodKeyValidator = (periodKey: string) => void;

function createPeriodKeyValidator(
  predicate: PeriodKeyPredicate,
): PeriodKeyValidator {
  return (periodKey: string) => {
    assertValidReportInput(predicate(periodKey));
  };
}

const PERIOD_KEY_VALIDATORS_BY_TYPE = {
  [REPORT_TYPE.DAILY]: createPeriodKeyValidator(isValidDailyPeriodKey),
  [REPORT_TYPE.WEEKLY]: createPeriodKeyValidator(isValidWeeklyPeriodKey),
} as const satisfies Record<ReportType, PeriodKeyValidator>;

export function validateOwnedReportPeriodKey(
  reportType: ReportType,
  periodKey: string,
): void {
  PERIOD_KEY_VALIDATORS_BY_TYPE[reportType](periodKey);
}
