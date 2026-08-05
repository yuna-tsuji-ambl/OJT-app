import {
  MESSAGE_ANNOUNCEMENT_ICON,
  MESSAGE_ANNOUNCEMENT_TOGGLE_LABEL,
} from '../domain/messageAnnouncementList';

interface MessageAnnouncementToggleProps {
  announced: boolean;
  onToggle: () => void;
  className?: string;
  ariaLabel?: string;
}

export function MessageAnnouncementToggle({
  announced,
  onToggle,
  className,
  ariaLabel = MESSAGE_ANNOUNCEMENT_TOGGLE_LABEL,
}: MessageAnnouncementToggleProps) {
  const classes = [
    'message-announcement-toggle',
    announced ? 'message-announcement-toggle--on' : null,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={classes}
      aria-label={ariaLabel}
      aria-pressed={announced}
      onClick={(event) => {
        event.stopPropagation();
        onToggle();
      }}
    >
      {MESSAGE_ANNOUNCEMENT_ICON}
    </button>
  );
}
