import type { Response } from 'express';
import {
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
