import type { Response } from 'express';
import {
  ConditionInvalidValueError,
  ConditionRecordNotFoundError,
  ForbiddenError,
  QuestNotFoundError,
  TrainerStatusNotFoundError,
} from '../domain/errors.js';

export function sendQuestErrorResponse(
  response: Response,
  error: unknown,
): void {
  if (error instanceof QuestNotFoundError) {
    response.status(404).json({ error: 'Not found' });
    return;
  }

  if (error instanceof ForbiddenError) {
    response.status(403).json({ error: 'Forbidden' });
    return;
  }

  response.status(401).json({ error: 'Unauthorized' });
}

export function sendConditionErrorResponse(
  response: Response,
  error: unknown,
): void {
  if (error instanceof ConditionInvalidValueError) {
    response.status(400).json({ error: 'Invalid condition input' });
    return;
  }

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
