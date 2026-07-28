import {
  STAMP_REPLY_REGION_LABEL,
  type MessageStampOption,
} from '../domain/messageStampForm';

interface StampReplyBarProps {
  stamps: readonly MessageStampOption[];
  onReply: (stampId: string) => void;
}

export function StampReplyBar({ stamps, onReply }: StampReplyBarProps) {
  return (
    <section
      className="stamp-reply-region"
      role="region"
      aria-label={STAMP_REPLY_REGION_LABEL}
    >
      <div className="btn-group">
        {stamps.map((stamp) => (
          <button
            key={stamp.id}
            type="button"
            className="btn btn-secondary"
            onClick={() => onReply(stamp.id)}
          >
            {stamp.label}
          </button>
        ))}
      </div>
    </section>
  );
}
