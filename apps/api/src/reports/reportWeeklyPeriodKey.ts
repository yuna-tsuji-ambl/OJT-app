const WEEKLY_PERIOD_KEY_PATTERN = /^(\d{4})-W(\d{2})$/;

const MIN_ISO_WEEK = 1;
const MAX_ISO_WEEK = 53;

export function isValidWeeklyPeriodKey(value: string): boolean {
  const match = WEEKLY_PERIOD_KEY_PATTERN.exec(value);

  if (!match) {
    return false;
  }

  const week = Number(match[2]);

  return week >= MIN_ISO_WEEK && week <= MAX_ISO_WEEK;
}
