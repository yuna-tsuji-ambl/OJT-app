import { describe, expect, it } from 'vitest';
import type { ThreadChatMessage } from '@ojt-app/shared';
import {
  buildThreadHistoryRows,
  formatMessageClockTime,
  formatThreadDateSeparatorLabel,
} from './messageThreadTimestamp';

/** テスト用: Asia/Tokyo 固定で日付境界を安定させる */
const TZ = 'Asia/Tokyo';

function msg(
  id: string,
  createdAt: string,
  content = 'hello',
): ThreadChatMessage {
  return {
    id,
    threadId: 'thread-1',
    senderId: 'trainee-1',
    receiverId: 'trainer-1',
    content,
    type: 'text',
    createdAt,
  };
}

describe('U-TB02/U-TB09/U-TB10 formatMessageClockTime', () => {
  it('createdAt_ローカルH:mmを返す', () => {
    // 2026-07-29T05:30:00.000Z = Asia/Tokyo 14:30
    expect(formatMessageClockTime('2026-07-29T05:30:00.000Z', TZ)).toBe(
      '14:30',
    );
  });

  it('U-TB10: 不正なcreatedAt_空文字を返す', () => {
    expect(formatMessageClockTime('not-a-date', TZ)).toBe('');
  });
});

describe('U-TB06 formatThreadDateSeparatorLabel', () => {
  const now = new Date('2026-08-03T03:00:00.000Z'); // Asia/Tokyo 2026-08-03 12:00

  it('今日_今日ラベル', () => {
    expect(formatThreadDateSeparatorLabel('2026-08-03', now, TZ)).toBe('今日');
  });

  it('昨日_昨日ラベル', () => {
    expect(formatThreadDateSeparatorLabel('2026-08-02', now, TZ)).toBe('昨日');
  });

  it('それ以外_年月日ラベル', () => {
    expect(formatThreadDateSeparatorLabel('2026-07-29', now, TZ)).toBe(
      '2026年7月29日',
    );
  });
});

describe('U-TB05/U-TB06/U-TB09/U-TB11 buildThreadHistoryRows', () => {
  const now = new Date('2026-08-03T03:00:00.000Z');

  it('同一日の先頭だけ日付区切り_各通にH:mm', () => {
    const rows = buildThreadHistoryRows(
      [
        msg('1', '2026-07-29T05:30:00.000Z'),
        msg('2', '2026-07-29T05:32:00.000Z'),
      ],
      now,
      TZ,
    );

    expect(rows).toEqual([
      { kind: 'date-separator', dateKey: '2026-07-29', label: '2026年7月29日' },
      {
        kind: 'message',
        message: expect.objectContaining({ id: '1' }),
        timeLabel: '14:30',
      },
      {
        kind: 'message',
        message: expect.objectContaining({ id: '2' }),
        timeLabel: '14:32',
      },
    ]);
  });

  it('日付をまたぐ_各日の先頭に区切り', () => {
    const rows = buildThreadHistoryRows(
      [
        msg('1', '2026-08-02T05:00:00.000Z'), // Tokyo 8/2 14:00
        msg('2', '2026-08-03T00:05:00.000Z'), // Tokyo 8/3 09:05
      ],
      now,
      TZ,
    );

    const separators = rows.filter((r) => r.kind === 'date-separator');
    expect(separators).toEqual([
      { kind: 'date-separator', dateKey: '2026-08-02', label: '昨日' },
      { kind: 'date-separator', dateKey: '2026-08-03', label: '今日' },
    ]);
  });

  it('空日の日付区切りを出さない', () => {
    const rows = buildThreadHistoryRows(
      [
        msg('1', '2026-07-29T05:30:00.000Z'),
        msg('2', '2026-08-03T00:05:00.000Z'),
      ],
      now,
      TZ,
    );

    const dateKeys = rows
      .filter((r) => r.kind === 'date-separator')
      .map((r) => (r.kind === 'date-separator' ? r.dateKey : ''));

    expect(dateKeys).toEqual(['2026-07-29', '2026-08-03']);
    expect(dateKeys).not.toContain('2026-07-30');
    expect(dateKeys).not.toContain('2026-08-01');
    expect(dateKeys).not.toContain('2026-08-02');
  });

  it('空配列_空の行', () => {
    expect(buildThreadHistoryRows([], now, TZ)).toEqual([]);
  });

  it('U-TB10: 不正createdAt混入でもクラッシュせず区切りを付けない', () => {
    const rows = buildThreadHistoryRows(
      [msg('bad', 'not-a-date'), msg('ok', '2026-07-29T05:30:00.000Z')],
      now,
      TZ,
    );

    expect(rows).toEqual([
      {
        kind: 'message',
        message: expect.objectContaining({ id: 'bad' }),
        timeLabel: '',
      },
      { kind: 'date-separator', dateKey: '2026-07-29', label: '2026年7月29日' },
      {
        kind: 'message',
        message: expect.objectContaining({ id: 'ok' }),
        timeLabel: '14:30',
      },
    ]);
  });
});
