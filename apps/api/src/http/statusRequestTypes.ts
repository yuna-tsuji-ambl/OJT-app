import { isTrainerStatusType } from '../domain/statusConstants.js';
import type { TrainerStatusType } from '../domain/statusConstants.js';

export interface StatusUpdateBody {
  status: TrainerStatusType;
}

export interface QuestionMessageBody {
  trainerId: string;
  content: string;
}

export interface ReplyMessageBody {
  traineeId: string;
  content: string;
}

export function parseStatusUpdateBody(body: unknown): StatusUpdateBody | null {
  if (
    typeof body !== 'object' ||
    body === null ||
    !('status' in body) ||
    typeof body.status !== 'string' ||
    !isTrainerStatusType(body.status)
  ) {
    return null;
  }

  return { status: body.status };
}
