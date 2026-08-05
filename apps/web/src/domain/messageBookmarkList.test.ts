import { describe, expect, it } from 'vitest';
import type { MessageBookmark, MessageThreadListItem } from '@ojt-app/shared';
import {
  collectBookmarkedThreadIds,
  collectThreadBookmarkedAtById,
  filterThreadsByBookmark,
  listMessageBookmarksOnly,
  sortMessageBookmarks,
  sortThreadListItemsByBookmark,
} from './messageBookmarkList';

function threadItem(id: string): MessageThreadListItem {
  return {
    thread: {
      id,
      traineeId: 'trainee-1',
      trainerId: 'trainer-1',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    firstMessage: {
      id: `m-${id}`,
      threadId: id,
      senderId: 'trainee-1',
      receiverId: 'trainer-1',
      content: 'preview',
      type: 'text',
      createdAt: '2026-01-01T00:00:00.000Z',
    },
  };
}

describe('U-BM06 filterThreadsByBookmark', () => {
  it('フィルタOFF_全件', () => {
    const threads = [threadItem('a'), threadItem('b')];
    expect(
      filterThreadsByBookmark(threads, new Set(['a']), false).map(
        (item) => item.thread.id,
      ),
    ).toEqual(['a', 'b']);
  });

  it('フィルタON_BM済みのみ', () => {
    const threads = [threadItem('a'), threadItem('b')];
    expect(
      filterThreadsByBookmark(threads, new Set(['a']), true).map(
        (item) => item.thread.id,
      ),
    ).toEqual(['a']);
  });
});

describe('U-BM15 listMessageBookmarksOnly', () => {
  it('メッセージBMのみ抽出', () => {
    const bookmarks: MessageBookmark[] = [
      {
        id: '1',
        ownerUserId: 'u',
        targetType: 'thread',
        threadId: 't1',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: '2',
        ownerUserId: 'u',
        targetType: 'message',
        threadId: 't1',
        messageId: 'm1',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    ];
    expect(listMessageBookmarksOnly(bookmarks)).toHaveLength(1);
    expect(collectBookmarkedThreadIds(bookmarks).has('t1')).toBe(true);
  });
});

describe('sortMessageBookmarks', () => {
  const bookmarks: MessageBookmark[] = [
    {
      id: 'a',
      ownerUserId: 'u',
      targetType: 'message',
      threadId: 't1',
      messageId: 'm1',
      messageCreatedAt: '2026-08-01T10:00:00.000Z',
      createdAt: '2026-08-03T12:00:00.000Z',
    },
    {
      id: 'b',
      ownerUserId: 'u',
      targetType: 'message',
      threadId: 't1',
      messageId: 'm2',
      messageCreatedAt: '2026-08-02T10:00:00.000Z',
      createdAt: '2026-08-03T10:00:00.000Z',
    },
  ];

  it('送信時刻_昇順', () => {
    expect(
      sortMessageBookmarks(bookmarks, 'messageSentAsc').map((item) => item.id),
    ).toEqual(['a', 'b']);
  });

  it('送信時刻_降順', () => {
    expect(
      sortMessageBookmarks(bookmarks, 'messageSentDesc').map((item) => item.id),
    ).toEqual(['b', 'a']);
  });

  it('BM追加_昇順', () => {
    expect(
      sortMessageBookmarks(bookmarks, 'bookmarkedAsc').map((item) => item.id),
    ).toEqual(['b', 'a']);
  });

  it('BM追加_降順', () => {
    expect(
      sortMessageBookmarks(bookmarks, 'bookmarkedDesc').map((item) => item.id),
    ).toEqual(['a', 'b']);
  });
});

describe('sortThreadListItemsByBookmark', () => {
  it('最終更新_降順とBM追加_昇順', () => {
    const threads = [
      threadItem('a'),
      {
        ...threadItem('b'),
        thread: {
          ...threadItem('b').thread,
          updatedAt: '2026-02-01T00:00:00.000Z',
        },
      },
    ];
    const bookmarkedAt = collectThreadBookmarkedAtById([
      {
        id: '1',
        ownerUserId: 'u',
        targetType: 'thread',
        threadId: 'a',
        createdAt: '2026-03-01T00:00:00.000Z',
      },
      {
        id: '2',
        ownerUserId: 'u',
        targetType: 'thread',
        threadId: 'b',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    ]);

    expect(
      sortThreadListItemsByBookmark(threads, 'updatedDesc', bookmarkedAt).map(
        (item) => item.thread.id,
      ),
    ).toEqual(['b', 'a']);
    expect(
      sortThreadListItemsByBookmark(threads, 'bookmarkedAsc', bookmarkedAt).map(
        (item) => item.thread.id,
      ),
    ).toEqual(['b', 'a']);
  });
});
