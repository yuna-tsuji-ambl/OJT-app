import { DEFAULT_TRAINEE_ID } from './participantConstants';

export function createTrainerThreadReplyBase(threadId: string) {
  return {
    threadId,
    traineeId: DEFAULT_TRAINEE_ID,
  };
}

export function createTrainerNewMessagePayload(templateId: string) {
  return {
    templateId,
    traineeId: DEFAULT_TRAINEE_ID,
  };
}

export function createTrainerTemplateReplyPayload(
  threadId: string,
  templateId: string,
) {
  return {
    ...createTrainerThreadReplyBase(threadId),
    templateId,
  };
}

export function createTrainerStampReplyPayload(
  threadId: string,
  stampId: string,
) {
  return {
    ...createTrainerThreadReplyBase(threadId),
    stampId,
  };
}
