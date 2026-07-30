const MS_PER_DAY = 86_400_000;

export function parseIsoDate(date: string): Date {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function formatIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function daysBetweenInclusive(
  startDate: string,
  endDate: string,
): number {
  const start = parseIsoDate(startDate);
  const end = parseIsoDate(endDate);
  return Math.round((end.getTime() - start.getTime()) / MS_PER_DAY) + 1;
}

export function addDays(date: string, days: number): string {
  const next = parseIsoDate(date);
  next.setDate(next.getDate() + days);
  return formatIsoDate(next);
}

export function shiftDateRange(
  startDate: string,
  endDate: string,
  dayDelta: number,
): { startDate: string; endDate: string } {
  return {
    startDate: addDays(startDate, dayDelta),
    endDate: addDays(endDate, dayDelta),
  };
}

export function clampStartDate(
  startDate: string,
  endDate: string,
): { startDate: string; endDate: string } {
  if (startDate > endDate) {
    return { startDate: endDate, endDate };
  }
  return { startDate, endDate };
}

export function clampEndDate(
  startDate: string,
  endDate: string,
): { startDate: string; endDate: string } {
  if (endDate < startDate) {
    return { startDate, endDate: startDate };
  }
  return { startDate, endDate };
}

export function computeGanttRange(
  goals: readonly { startDate: string; endDate: string }[],
): { rangeStart: string; rangeEnd: string; totalDays: number } {
  if (goals.length === 0) {
    const today = formatIsoDate(new Date());
    return { rangeStart: today, rangeEnd: today, totalDays: 1 };
  }

  let rangeStart = goals[0].startDate;
  let rangeEnd = goals[0].endDate;

  for (const goal of goals) {
    if (goal.startDate < rangeStart) {
      rangeStart = goal.startDate;
    }
    if (goal.endDate > rangeEnd) {
      rangeEnd = goal.endDate;
    }
  }

  return {
    rangeStart,
    rangeEnd,
    totalDays: daysBetweenInclusive(rangeStart, rangeEnd),
  };
}

export function dayOffsetFromRangeStart(
  rangeStart: string,
  date: string,
): number {
  const start = parseIsoDate(rangeStart);
  const target = parseIsoDate(date);
  return Math.round((target.getTime() - start.getTime()) / MS_PER_DAY);
}

export function formatGanttAxisLabel(date: string): string {
  const parsed = parseIsoDate(date);
  return `${parsed.getMonth() + 1}/${parsed.getDate()}`;
}

function ganttAxisTickStep(totalDays: number): number {
  if (totalDays <= 21) {
    return 1;
  }
  if (totalDays <= 45) {
    return 2;
  }
  return 7;
}

export interface GanttAxisTick {
  readonly date: string;
  readonly label: string;
  readonly offsetDays: number;
}

/** ガント横軸（日単位）の目盛り。両端は常に含め、期間に応じて間引きする。 */
export function buildGanttAxisTicks(
  rangeStart: string,
  totalDays: number,
): readonly GanttAxisTick[] {
  if (totalDays < 1) {
    return [];
  }

  const step = ganttAxisTickStep(totalDays);
  const ticks: GanttAxisTick[] = [];

  for (let offset = 0; offset < totalDays; offset += step) {
    const date = addDays(rangeStart, offset);
    ticks.push({
      date,
      label: formatGanttAxisLabel(date),
      offsetDays: offset,
    });
  }

  const lastOffset = totalDays - 1;
  if (ticks[ticks.length - 1]?.offsetDays !== lastOffset) {
    const date = addDays(rangeStart, lastOffset);
    ticks.push({
      date,
      label: formatGanttAxisLabel(date),
      offsetDays: lastOffset,
    });
  }

  return ticks;
}
