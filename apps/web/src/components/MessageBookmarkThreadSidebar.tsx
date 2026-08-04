import type {
  InlineMessageThreadDetailState,
  MessageThreadListItem,
} from '@ojt-app/shared';
import type { ThreadBookmarkSortOption } from '../domain/messageBookmarkList';
import { MessageBookmarkControls } from './MessageBookmarkControls';
import { MessageThreadList } from './MessageThreadList';

interface MessageBookmarkThreadSidebarProps {
  bookmarkedOnly: boolean;
  onBookmarkedOnlyChange: (value: boolean) => void;
  threadSortOption: ThreadBookmarkSortOption;
  onThreadSortOptionChange: (value: ThreadBookmarkSortOption) => void;
  showBookmarkedMessages: boolean;
  onToggleBookmarkedMessages: () => void;
  threads: MessageThreadListItem[];
  page: number;
  totalPages: number;
  onNextPage: () => void;
  inlineDetail: InlineMessageThreadDetailState;
  onSelectThread: (threadId: string) => void;
  bookmarkedThreadIds: ReadonlySet<string>;
  onToggleThreadBookmark: (threadId: string) => void;
}

/** 左ペイン: ブックマーク操作 + トーク一覧 */
export function MessageBookmarkThreadSidebar({
  bookmarkedOnly,
  onBookmarkedOnlyChange,
  threadSortOption,
  onThreadSortOptionChange,
  showBookmarkedMessages,
  onToggleBookmarkedMessages,
  threads,
  page,
  totalPages,
  onNextPage,
  inlineDetail,
  onSelectThread,
  bookmarkedThreadIds,
  onToggleThreadBookmark,
}: MessageBookmarkThreadSidebarProps) {
  return (
    <>
      <MessageBookmarkControls
        bookmarkedOnly={bookmarkedOnly}
        onBookmarkedOnlyChange={onBookmarkedOnlyChange}
        threadSortOption={threadSortOption}
        onThreadSortOptionChange={onThreadSortOptionChange}
        showBookmarkedMessages={showBookmarkedMessages}
        onToggleBookmarkedMessages={onToggleBookmarkedMessages}
      />
      <MessageThreadList
        threads={threads}
        page={page}
        totalPages={totalPages}
        onNextPage={onNextPage}
        inlineDetail={inlineDetail}
        onSelectThread={onSelectThread}
        bookmarkedThreadIds={bookmarkedThreadIds}
        onToggleThreadBookmark={onToggleThreadBookmark}
      />
    </>
  );
}
