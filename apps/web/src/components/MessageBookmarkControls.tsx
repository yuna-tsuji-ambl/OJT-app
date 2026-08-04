import {
  MESSAGE_BOOKMARK_ICON,
  MESSAGE_BOOKMARK_MESSAGES_LIST_LABEL,
  MESSAGE_BOOKMARK_SORT_LABEL,
  MESSAGE_BOOKMARK_THREAD_FILTER_LABEL,
  THREAD_BOOKMARK_SORT_OPTIONS,
  type ThreadBookmarkSortOption,
} from '../domain/messageBookmarkList';

interface MessageBookmarkControlsProps {
  bookmarkedOnly: boolean;
  onBookmarkedOnlyChange: (value: boolean) => void;
  threadSortOption: ThreadBookmarkSortOption;
  onThreadSortOptionChange: (value: ThreadBookmarkSortOption) => void;
  showBookmarkedMessages: boolean;
  onToggleBookmarkedMessages: () => void;
}

export function MessageBookmarkControls({
  bookmarkedOnly,
  onBookmarkedOnlyChange,
  threadSortOption,
  onThreadSortOptionChange,
  showBookmarkedMessages,
  onToggleBookmarkedMessages,
}: MessageBookmarkControlsProps) {
  return (
    <div className="message-bookmark-controls">
      <div className="message-bookmark-controls__row">
        <label className="message-bookmark-controls__filter">
          <input
            type="checkbox"
            checked={bookmarkedOnly}
            onChange={(event) => onBookmarkedOnlyChange(event.target.checked)}
          />
          {MESSAGE_BOOKMARK_THREAD_FILTER_LABEL}
        </label>
        <button
          type="button"
          className={
            showBookmarkedMessages
              ? 'message-bookmark-controls__messages message-bookmark-controls__messages--active'
              : 'message-bookmark-controls__messages'
          }
          aria-pressed={showBookmarkedMessages}
          onClick={onToggleBookmarkedMessages}
        >
          <span
            className="message-bookmark-controls__messages-icon"
            aria-hidden="true"
          >
            {MESSAGE_BOOKMARK_ICON}
          </span>
          {MESSAGE_BOOKMARK_MESSAGES_LIST_LABEL}
        </button>
      </div>
      <div className="message-bookmark-controls__row message-bookmark-controls__row--sort">
        <label className="message-bookmark-controls__sort">
          <span className="message-bookmark-controls__sort-label">
            {MESSAGE_BOOKMARK_SORT_LABEL}
          </span>
          <select
            value={threadSortOption}
            onChange={(event) =>
              onThreadSortOptionChange(
                event.target.value as ThreadBookmarkSortOption,
              )
            }
          >
            {THREAD_BOOKMARK_SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
