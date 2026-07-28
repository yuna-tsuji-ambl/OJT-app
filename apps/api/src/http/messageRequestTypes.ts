export interface QuestionMessageBody {
  trainerId: string;
  content?: string;
  templateId?: string;
  threadId?: string;
  stampId?: string;
}

export function parseQuestionMessageBody(
  body: unknown,
): QuestionMessageBody | null {
  if (
    typeof body !== 'object' ||
    body === null ||
    !('trainerId' in body) ||
    typeof body.trainerId !== 'string'
  ) {
    return null;
  }

  const content =
    'content' in body && typeof body.content === 'string'
      ? body.content
      : undefined;
  const templateId =
    'templateId' in body && typeof body.templateId === 'string'
      ? body.templateId
      : undefined;
  const threadId =
    'threadId' in body && typeof body.threadId === 'string'
      ? body.threadId
      : undefined;
  const stampId =
    'stampId' in body && typeof body.stampId === 'string'
      ? body.stampId
      : undefined;

  if (!content && !templateId && !stampId) {
    return null;
  }

  if (stampId && !threadId) {
    return null;
  }

  return {
    trainerId: body.trainerId,
    content,
    templateId,
    threadId,
    stampId,
  };
}

export interface ReplyMessageBody {
  traineeId: string;
  content: string;
}

export interface TrainerThreadReplyBody {
  threadId: string;
  templateId: string;
  traineeId: string;
}

export interface TrainerStampReplyBody {
  threadId: string;
  stampId: string;
  traineeId: string;
}

export interface TrainerNewMessageBody {
  templateId: string;
  traineeId: string;
}

interface TrainerThreadScopedFields {
  threadId: string;
  traineeId: string;
}

function parseTrainerThreadScopedFields(
  body: unknown,
): TrainerThreadScopedFields | null {
  if (typeof body !== 'object' || body === null) {
    return null;
  }

  if (
    !('threadId' in body) ||
    typeof body.threadId !== 'string' ||
    !('traineeId' in body) ||
    typeof body.traineeId !== 'string'
  ) {
    return null;
  }

  if (!body.threadId || !body.traineeId) {
    return null;
  }

  return {
    threadId: body.threadId,
    traineeId: body.traineeId,
  };
}

export function parseTrainerThreadReplyBody(
  body: unknown,
): TrainerThreadReplyBody | null {
  const scopedFields = parseTrainerThreadScopedFields(body);

  if (!scopedFields || typeof body !== 'object' || body === null) {
    return null;
  }

  if (
    !('templateId' in body) ||
    typeof body.templateId !== 'string' ||
    !body.templateId
  ) {
    return null;
  }

  return {
    ...scopedFields,
    templateId: body.templateId,
  };
}

export function parseTrainerStampReplyBody(
  body: unknown,
): TrainerStampReplyBody | null {
  const scopedFields = parseTrainerThreadScopedFields(body);

  if (!scopedFields || typeof body !== 'object' || body === null) {
    return null;
  }

  if (
    !('stampId' in body) ||
    typeof body.stampId !== 'string' ||
    !body.stampId
  ) {
    return null;
  }

  return {
    ...scopedFields,
    stampId: body.stampId,
  };
}

export function parseTrainerNewMessageBody(
  body: unknown,
): TrainerNewMessageBody | null {
  if (typeof body !== 'object' || body === null) {
    return null;
  }

  if (
    'threadId' in body &&
    typeof body.threadId === 'string' &&
    body.threadId
  ) {
    return null;
  }

  if ('stampId' in body && typeof body.stampId === 'string' && body.stampId) {
    return null;
  }

  if (
    'content' in body &&
    typeof body.content === 'string' &&
    body.content.trim() !== ''
  ) {
    return null;
  }

  if (
    !('templateId' in body) ||
    typeof body.templateId !== 'string' ||
    !body.templateId ||
    !('traineeId' in body) ||
    typeof body.traineeId !== 'string' ||
    !body.traineeId
  ) {
    return null;
  }

  return {
    templateId: body.templateId,
    traineeId: body.traineeId,
  };
}

export function parseReplyMessageBody(body: unknown): ReplyMessageBody | null {
  if (
    typeof body !== 'object' ||
    body === null ||
    !('traineeId' in body) ||
    typeof body.traineeId !== 'string' ||
    !('content' in body) ||
    typeof body.content !== 'string' ||
    body.content.trim() === ''
  ) {
    return null;
  }

  return {
    traineeId: body.traineeId,
    content: body.content,
  };
}
