import type { MessageBookmark, MessageThreadListItem } from '@ojt-app/shared';

export const MESSAGE_BOOKMARK_THREAD_FILTER_LABEL =
  'ブックマークしたトーク' as const;

export const MESSAGE_BOOKMARK_MESSAGES_LIST_LABEL =
  'ブックマークしたメッセージ' as const;

export const MESSAGE_BOOKMARK_TOGGLE_LABEL = 'ブックマーク' as const;

/** ブックマーク UI のアイコン（ハート） */
export const MESSAGE_BOOKMARK_ICON = '♥' as const;

export const MESSAGE_BOOKMARK_SORT_LABEL = '並び替え' as const;

export type MessageBookmarkSortOption =
  'messageSentAsc' | 'messageSentDesc' | 'bookmarkedAsc' | 'bookmarkedDesc';

export const MESSAGE_BOOKMARK_SORT_OPTIONS: readonly {
  value: MessageBookmarkSortOption;
  label: string;
}[] = [
  { value: 'messageSentDesc', label: '送信時刻（新しい順）' },
  { value: 'messageSentAsc', label: '送信時刻（古い順）' },
  { value: 'bookmarkedDesc', label: 'ブックマーク追加（新しい順）' },
  { value: 'bookmarkedAsc', label: 'ブックマーク追加（古い順）' },
] as const;

export const DEFAULT_MESSAGE_BOOKMARK_SORT: MessageBookmarkSortOption =
  'bookmarkedDesc';

function compareIsoAsc(
  left: string | undefined,
  right: string | undefined,
): number {
  const leftKey = left ?? '';
  const rightKey = right ?? '';
  return leftKey.localeCompare(rightKey);
}

/** メッセージ BM 一覧の並び替え（純関数） */
export function sortMessageBookmarks(
  bookmarks: readonly MessageBookmark[],
  option: MessageBookmarkSortOption,
): MessageBookmark[] {
  const sorted = [...bookmarks];
  sorted.sort((left, right) => {
    switch (option) {
      case 'messageSentAsc':
        return compareIsoAsc(left.messageCreatedAt, right.messageCreatedAt);
      case 'messageSentDesc':
        return compareIsoAsc(right.messageCreatedAt, left.messageCreatedAt);
      case 'bookmarkedAsc':
        return compareIsoAsc(left.createdAt, right.createdAt);
      case 'bookmarkedDesc':
        return compareIsoAsc(right.createdAt, left.createdAt);
      default: {
        const _exhaustive: never = option;
        return _exhaustive;
      }
    }
  });
  return sorted;
}

export function collectBookmarkedThreadIds(
  bookmarks: readonly MessageBookmark[],
): ReadonlySet<string> {
  return new Set(
    bookmarks
      .filter((bookmark) => bookmark.targetType === 'thread')
      .map((bookmark) => bookmark.threadId),
  );
}

export function collectBookmarkedMessageIds(
  bookmarks: readonly MessageBookmark[],
): ReadonlySet<string> {
  return new Set(
    bookmarks
      .filter(
        (bookmark) =>
          bookmark.targetType === 'message' && bookmark.messageId != null,
      )
      .map((bookmark) => bookmark.messageId as string),
  );
}

export function filterThreadsByBookmark(
  threads: readonly MessageThreadListItem[],
  bookmarkedThreadIds: ReadonlySet<string>,
  bookmarkedOnly: boolean,
): MessageThreadListItem[] {
  if (!bookmarkedOnly) {
    return [...threads];
  }
  return threads.filter((item) => bookmarkedThreadIds.has(item.thread.id));
}

export type ThreadBookmarkSortOption =
  'updatedDesc' | 'updatedAsc' | 'bookmarkedDesc' | 'bookmarkedAsc';

export const THREAD_BOOKMARK_SORT_OPTIONS: readonly {
  value: ThreadBookmarkSortOption;
  label: string;
}[] = [
  { value: 'updatedDesc', label: '最終更新（新しい順）' },
  { value: 'updatedAsc', label: '最終更新（古い順）' },
  { value: 'bookmarkedDesc', label: 'ブックマーク追加（新しい順）' },
  { value: 'bookmarkedAsc', label: 'ブックマーク追加（古い順）' },
] as const;

export const DEFAULT_THREAD_BOOKMARK_SORT: ThreadBookmarkSortOption =
  'updatedDesc';

export function collectThreadBookmarkedAtById(
  bookmarks: readonly MessageBookmark[],
): ReadonlyMap<string, string> {
  const map = new Map<string, string>();
  for (const bookmark of bookmarks) {
    if (bookmark.targetType !== 'thread') {
      continue;
    }
    const existing = map.get(bookmark.threadId);
    if (!existing || bookmark.createdAt.localeCompare(existing) > 0) {
      map.set(bookmark.threadId, bookmark.createdAt);
    }
  }
  return map;
}

/** BM トーク一覧の並び替え（純関数） */
export function sortThreadListItemsByBookmark(
  threads: readonly MessageThreadListItem[],
  option: ThreadBookmarkSortOption,
  bookmarkedAtByThreadId: ReadonlyMap<string, string>,
): MessageThreadListItem[] {
  const sorted = [...threads];
  sorted.sort((left, right) => {
    switch (option) {
      case 'updatedAsc':
        return compareIsoAsc(left.thread.updatedAt, right.thread.updatedAt);
      case 'updatedDesc':
        return compareIsoAsc(right.thread.updatedAt, left.thread.updatedAt);
      case 'bookmarkedAsc':
        return compareIsoAsc(
          bookmarkedAtByThreadId.get(left.thread.id),
          bookmarkedAtByThreadId.get(right.thread.id),
        );
      case 'bookmarkedDesc':
        return compareIsoAsc(
          bookmarkedAtByThreadId.get(right.thread.id),
          bookmarkedAtByThreadId.get(left.thread.id),
        );
      default: {
        const _exhaustive: never = option;
        return _exhaustive;
      }
    }
  });
  return sorted;
}

export function listMessageBookmarksOnly(
  bookmarks: readonly MessageBookmark[],
): MessageBookmark[] {
  return bookmarks.filter((bookmark) => bookmark.targetType === 'message');
}
