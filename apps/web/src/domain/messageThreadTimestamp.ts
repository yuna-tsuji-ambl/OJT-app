import type { ThreadChatMessage } from '@ojt-app/shared';

export type ThreadHistoryDateSeparatorRow = {
  kind: 'date-separator';
  dateKey: string;
  label: string;
};

export type ThreadHistoryMessageRow = {
  kind: 'message';
  message: ThreadChatMessage;
  timeLabel: string;
};

export type ThreadHistoryRow =
  ThreadHistoryDateSeparatorRow | ThreadHistoryMessageRow;

function resolveTimeZone(timeZone?: string): string | undefined {
  return timeZone;
}

function partsInTimeZone(
  date: Date,
  timeZone?: string,
): { year: number; month: number; day: number; hour: number; minute: number } {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: resolveTimeZone(timeZone),
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hourCycle: 'h23',
  });
  const parts = formatter.formatToParts(date);
  const read = (type: Intl.DateTimeFormatPartTypes): number => {
    const value = parts.find((p) => p.type === type)?.value;
    return value ? Number(value) : Number.NaN;
  };
  return {
    year: read('year'),
    month: read('month'),
    day: read('day'),
    hour: read('hour'),
    minute: read('minute'),
  };
}

function toDateKey(year: number, month: number, day: number): string {
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function parseCreatedAt(createdAt: string): Date | null {
  const date = new Date(createdAt);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** 吹き出し用の時刻ラベル（`H:mm`）。不正なら空文字。 */
export function formatMessageClockTime(
  createdAt: string,
  timeZone?: string,
): string {
  const date = parseCreatedAt(createdAt);
  if (!date) {
    return '';
  }
  const { hour, minute } = partsInTimeZone(date, timeZone);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) {
    return '';
  }
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

/** ローカル日付キー `YYYY-MM-DD`。不正なら null。 */
export function toLocalDateKey(
  createdAt: string,
  timeZone?: string,
): string | null {
  const date = parseCreatedAt(createdAt);
  if (!date) {
    return null;
  }
  const { year, month, day } = partsInTimeZone(date, timeZone);
  if (![year, month, day].every(Number.isFinite)) {
    return null;
  }
  return toDateKey(year, month, day);
}

function shiftDateKey(dateKey: string, dayDelta: number): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const shifted = new Date(Date.UTC(y, m - 1, d + dayDelta));
  return toDateKey(
    shifted.getUTCFullYear(),
    shifted.getUTCMonth() + 1,
    shifted.getUTCDate(),
  );
}

/**
 * 日付区切りラベル。
 * 今日 / 昨日 / YYYY年M月D日（T-C。文言は実装既定）
 */
export function formatThreadDateSeparatorLabel(
  dateKey: string,
  now: Date,
  timeZone?: string,
): string {
  const todayParts = partsInTimeZone(now, timeZone);
  const todayKey = toDateKey(todayParts.year, todayParts.month, todayParts.day);

  if (dateKey === todayKey) {
    return '今日';
  }

  if (dateKey === shiftDateKey(todayKey, -1)) {
    return '昨日';
  }

  const [y, m, d] = dateKey.split('-').map(Number);
  if (![y, m, d].every(Number.isFinite)) {
    return dateKey;
  }
  return `${y}年${m}月${d}日`;
}

/**
 * 履歴を T-C 行に変換する。
 * メッセージが存在する日付にだけ区切りを出し、空日の区切りは作らない（BR-TB06）。
 */
export function buildThreadHistoryRows(
  messages: ThreadChatMessage[],
  now: Date = new Date(),
  timeZone?: string,
): ThreadHistoryRow[] {
  const rows: ThreadHistoryRow[] = [];
  let lastDateKey: string | null = null;

  for (const message of messages) {
    const dateKey = toLocalDateKey(message.createdAt, timeZone);
    const timeLabel = formatMessageClockTime(message.createdAt, timeZone);

    if (dateKey && dateKey !== lastDateKey) {
      rows.push({
        kind: 'date-separator',
        dateKey,
        label: formatThreadDateSeparatorLabel(dateKey, now, timeZone),
      });
      lastDateKey = dateKey;
    }

    rows.push({
      kind: 'message',
      message,
      timeLabel,
    });
  }

  return rows;
}
