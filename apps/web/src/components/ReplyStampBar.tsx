import { REPLY_STAMPS } from '../domain/statusConstants';

interface ReplyStampBarProps {
  onReply: (stamp: string) => void;
}

export function ReplyStampBar({ onReply }: ReplyStampBarProps) {
  return (
    <div className="btn-group">
      {REPLY_STAMPS.map((stamp) => (
        <button
          key={stamp}
          type="button"
          className="btn btn-secondary"
          onClick={() => onReply(stamp)}
        >
          {stamp}
        </button>
      ))}
    </div>
  );
}
