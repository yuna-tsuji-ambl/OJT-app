import type { MessageAnnouncement, UserRole } from '@ojt-app/shared';

export const MESSAGE_ANNOUNCEMENT_LIST_LABEL = 'アナウンスメッセージ' as const;

export const MESSAGE_ANNOUNCEMENT_TOGGLE_LABEL = 'アナウンス' as const;

export const MESSAGE_ANNOUNCEMENT_ICON = '📢' as const;

export const MESSAGE_ANNOUNCEMENT_SORT_LABEL = '並び替え' as const;

export const MESSAGE_ANNOUNCEMENT_FILTER_LABEL = '絞り込み' as const;

export type MessageAnnouncementSortOption =
  'messageSentAsc' | 'messageSentDesc' | 'announcedAsc' | 'announcedDesc';

export const MESSAGE_ANNOUNCEMENT_SORT_OPTIONS: readonly {
  value: MessageAnnouncementSortOption;
  label: string;
}[] = [
  { value: 'messageSentDesc', label: '送信時刻（新しい順）' },
  { value: 'messageSentAsc', label: '送信時刻（古い順）' },
  { value: 'announcedDesc', label: 'アナウンス追加（新しい順）' },
  { value: 'announcedAsc', label: 'アナウンス追加（古い順）' },
] as const;

export const DEFAULT_MESSAGE_ANNOUNCEMENT_SORT: MessageAnnouncementSortOption =
  'announcedDesc';

export type MessageAnnouncementRoleFilter = 'all' | UserRole;

export const MESSAGE_ANNOUNCEMENT_ROLE_FILTER_OPTIONS: readonly {
  value: MessageAnnouncementRoleFilter;
  label: string;
}[] = [
  { value: 'all', label: 'すべて' },
  { value: 'trainee', label: '新卒アナウンスのみ' },
  { value: 'trainer', label: 'トレーナーアナウンスのみ' },
] as const;

export const DEFAULT_MESSAGE_ANNOUNCEMENT_ROLE_FILTER: MessageAnnouncementRoleFilter =
  'all';

function compareIsoAsc(
  left: string | undefined,
  right: string | undefined,
): number {
  const leftKey = left ?? '';
  const rightKey = right ?? '';
  return leftKey.localeCompare(rightKey);
}

/** アナウンス一覧の並び替え（純関数） */
export function sortMessageAnnouncements(
  announcements: readonly MessageAnnouncement[],
  option: MessageAnnouncementSortOption,
): MessageAnnouncement[] {
  const sorted = [...announcements];
  sorted.sort((left, right) => {
    switch (option) {
      case 'messageSentAsc':
        return compareIsoAsc(left.messageCreatedAt, right.messageCreatedAt);
      case 'messageSentDesc':
        return compareIsoAsc(right.messageCreatedAt, left.messageCreatedAt);
      case 'announcedAsc':
        return compareIsoAsc(left.createdAt, right.createdAt);
      case 'announcedDesc':
        return compareIsoAsc(right.createdAt, left.createdAt);
      default: {
        const _exhaustive: never = option;
        return _exhaustive;
      }
    }
  });
  return sorted;
}

/** アナウンスした人のロールで絞り込み（純関数） */
export function filterMessageAnnouncementsByRole(
  announcements: readonly MessageAnnouncement[],
  filter: MessageAnnouncementRoleFilter,
): MessageAnnouncement[] {
  if (filter === 'all') {
    return [...announcements];
  }
  return announcements.filter(
    (announcement) => announcement.announcedByRole === filter,
  );
}

export function collectAnnouncedMessageIds(
  announcements: readonly MessageAnnouncement[],
): ReadonlySet<string> {
  return new Set(announcements.map((announcement) => announcement.messageId));
}

export function buildAnnouncementCountLabel(count: number): string {
  return `アナウンスメッセージ ${count}件`;
}
