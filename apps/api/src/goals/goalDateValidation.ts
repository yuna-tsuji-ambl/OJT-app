const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function isValidIsoDateString(value: string): boolean {
  if (!ISO_DATE_PATTERN.test(value)) {
    return false;
  }

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year!, month! - 1, day!));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month! - 1 &&
    date.getUTCDate() === day!
  );
}

export function isValidGoalDateRange(
  startDate: string,
  endDate: string,
): boolean {
  return startDate <= endDate;
}
