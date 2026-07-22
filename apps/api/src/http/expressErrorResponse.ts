import type { Response } from 'express';
import {
  AssignmentNotFoundError,
  ConditionRecordNotFoundError,
  ForbiddenError,
  InvalidAssignmentStatusError,
  QuestNotFoundError,
  TrainerStatusNotFoundError,
} from '../domain/errors.js';

function sendSharedAuthErrors(response: Response, error: unknown): boolean {
  if (error instanceof ForbiddenError) {
    response.status(403).json({ error: 'Forbidden' });
    return true;
  }

  return false;
}

export function sendQuestErrorResponse(
  response: Response,
  error: unknown,
): void {
  if (
    error instanceof QuestNotFoundError ||
    error instanceof AssignmentNotFoundError
  ) {
    response.status(404).json({ error: 'Not found' });
    return;
  }

  if (error instanceof InvalidAssignmentStatusError) {
    response.status(409).json({ error: 'Invalid assignment status' });
    return;
  }

  if (sendSharedAuthErrors(response, error)) {
    return;
  }

  response.status(401).json({ error: 'Unauthorized' });
}

export function sendAssignmentErrorResponse(
  response: Response,
  error: unknown,
): void {
  if (error instanceof AssignmentNotFoundError) {
    response.status(404).json({ error: 'Not found' });
    return;
  }

  if (error instanceof InvalidAssignmentStatusError) {
    response.status(409).json({ error: 'Invalid assignment status' });
    return;
  }

  if (sendSharedAuthErrors(response, error)) {
    return;
  }

  response.status(401).json({ error: 'Unauthorized' });
}

export function sendConditionErrorResponse(
  response: Response,
  error: unknown,
): void {
  if (error instanceof ConditionRecordNotFoundError) {
    response.status(404).json({ error: 'Not found' });
    return;
  }

  if (error instanceof ForbiddenError) {
    response.status(403).json({ error: 'Forbidden' });
    return;
  }

  response.status(401).json({ error: 'Unauthorized' });
}

export function sendStatusErrorResponse(
  response: Response,
  error: unknown,
): void {
  if (error instanceof TrainerStatusNotFoundError) {
    response.status(404).json({ error: 'Not found' });
    return;
  }

  if (error instanceof ForbiddenError) {
    response.status(403).json({ error: 'Forbidden' });
    return;
  }

  response.status(401).json({ error: 'Unauthorized' });
}
