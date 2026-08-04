import { buildAnnouncementCountLabel } from '../domain/messageAnnouncementList';

interface MessageAnnouncementCountButtonProps {
  count: number;
  pressed: boolean;
  onClick: () => void;
}

export function MessageAnnouncementCountButton({
  count,
  pressed,
  onClick,
}: MessageAnnouncementCountButtonProps) {
  return (
    <button
      type="button"
      className="message-announcement-count-button"
      aria-pressed={pressed}
      onClick={onClick}
    >
      {buildAnnouncementCountLabel(count)}
    </button>
  );
}
