import { DEFAULT_TRAINER_ID } from './participantConstants';

export function createTraineeThreadTextReplyPayload(
  threadId: string,
  content: string,
) {
  return {
    trainerId: DEFAULT_TRAINER_ID,
    threadId,
    content,
  };
}

export function createTraineeThreadStampReplyPayload(
  threadId: string,
  stampId: string,
) {
  return {
    trainerId: DEFAULT_TRAINER_ID,
    threadId,
    stampId,
  };
}
