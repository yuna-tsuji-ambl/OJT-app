import { STAMPS } from '@ojt-app/shared';
import { StampReplyBar } from './StampReplyBar';

interface TrainerStampReplyBarProps {
  onReply: (stampId: string) => void;
}

export function TrainerStampReplyBar({ onReply }: TrainerStampReplyBarProps) {
  return <StampReplyBar stamps={STAMPS} onReply={onReply} />;
}
