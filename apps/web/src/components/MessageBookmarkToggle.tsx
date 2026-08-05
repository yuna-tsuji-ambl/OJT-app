import {
  MESSAGE_BOOKMARK_ICON,
  MESSAGE_BOOKMARK_TOGGLE_LABEL,
} from '../domain/messageBookmarkList';

interface MessageBookmarkToggleProps {
  bookmarked: boolean;
  onToggle: () => void;
  className?: string;
  ariaLabel?: string;
}

export function MessageBookmarkToggle({
  bookmarked,
  onToggle,
  className,
  ariaLabel = MESSAGE_BOOKMARK_TOGGLE_LABEL,
}: MessageBookmarkToggleProps) {
  const classes = [
    'message-bookmark-toggle',
    bookmarked ? 'message-bookmark-toggle--on' : null,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={classes}
      aria-label={ariaLabel}
      aria-pressed={bookmarked}
      onClick={(event) => {
        event.stopPropagation();
        onToggle();
      }}
    >
      {MESSAGE_BOOKMARK_ICON}
    </button>
  );
}
