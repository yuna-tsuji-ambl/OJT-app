import { TRAINEE_STAMPS } from '@ojt-app/shared';
import { StampReplyBar } from './StampReplyBar';

interface TraineeStampReplyBarProps {
  onReply: (stampId: string) => void;
}

export function TraineeStampReplyBar({ onReply }: TraineeStampReplyBarProps) {
  return <StampReplyBar stamps={TRAINEE_STAMPS} onReply={onReply} />;
}
