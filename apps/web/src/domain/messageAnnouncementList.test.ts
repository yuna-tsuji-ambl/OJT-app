import { describe, expect, it } from 'vitest';
import type { MessageAnnouncement } from '@ojt-app/shared';
import {
  filterMessageAnnouncementsByRole,
  sortMessageAnnouncements,
} from './messageAnnouncementList';

function announcement(
  overrides: Partial<MessageAnnouncement> &
    Pick<MessageAnnouncement, 'id' | 'messageId'>,
): MessageAnnouncement {
  return {
    threadId: 'thread-1',
    announcedByUserId: 'trainee-1',
    announcedByRole: 'trainee',
    createdAt: '2026-08-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('messageAnnouncementList', () => {
  it('U-AN01: 送信時刻・追加時刻で並び替えできる', () => {
    const items = [
      announcement({
        id: 'a',
        messageId: 'm1',
        messageCreatedAt: '2026-08-01T10:00:00.000Z',
        createdAt: '2026-08-02T10:00:00.000Z',
      }),
      announcement({
        id: 'b',
        messageId: 'm2',
        messageCreatedAt: '2026-08-01T12:00:00.000Z',
        createdAt: '2026-08-02T09:00:00.000Z',
      }),
    ];

    expect(
      sortMessageAnnouncements(items, 'messageSentDesc').map((item) => item.id),
    ).toEqual(['b', 'a']);
    expect(
      sortMessageAnnouncements(items, 'announcedAsc').map((item) => item.id),
    ).toEqual(['b', 'a']);
  });

  it('U-AN02: アナウンスした人のロールで絞り込める', () => {
    const items = [
      announcement({
        id: 'a',
        messageId: 'm1',
        announcedByRole: 'trainee',
      }),
      announcement({
        id: 'b',
        messageId: 'm2',
        announcedByUserId: 'trainer-1',
        announcedByRole: 'trainer',
      }),
    ];

    expect(
      filterMessageAnnouncementsByRole(items, 'trainee').map((item) => item.id),
    ).toEqual(['a']);
    expect(
      filterMessageAnnouncementsByRole(items, 'trainer').map((item) => item.id),
    ).toEqual(['b']);
    expect(filterMessageAnnouncementsByRole(items, 'all')).toHaveLength(2);
  });
});
