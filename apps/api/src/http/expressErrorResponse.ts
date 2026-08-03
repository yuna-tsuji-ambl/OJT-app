import type { Response } from 'express';
import {
  AssignmentNotFoundError,
  ConditionInvalidValueError,
  ConditionRecordNotFoundError,
  ForbiddenError,
  InvalidAssignmentStatusError,
  LegacyQuickReplyNotSupportedError,
  MessageContentRequiredError,
  MessageTemplateRequiredError,
  MessageThreadNotFoundError,
  QuestNotFoundError,
  GoalInvalidInputError,
  GoalNotFoundError,
  LearningInvalidInputError,
  ReportInvalidInputError,
  ReportNotFoundError,
  TrainerStatusNotFoundError,
  UnauthorizedError,
  UnknownQuestionTemplateError,
  UnknownReplyTemplateError,
  UnknownStampError,
} from '../domain/errors.js';

function sendSharedAuthErrors(response: Response, error: unknown): boolean {
  if (error instanceof UnauthorizedError) {
    response.status(401).json({ error: 'Unauthorized' });
    return true;
  }

  if (error instanceof ForbiddenError) {
    response.status(403).json({ error: 'Forbidden' });
    return true;
  }

  return false;
}

export function sendSharedAuthErrorResponse(
  response: Response,
  error: unknown,
): void {
  if (sendSharedAuthErrors(response, error)) {
    return;
  }

  response.status(500).json({ error: 'Internal server error' });
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
  if (error instanceof ConditionInvalidValueError) {
    response.status(400).json({ error: 'Invalid condition input' });
    return;
  }

  if (error instanceof ConditionRecordNotFoundError) {
    response.status(404).json({ error: 'Not found' });
    return;
  }

  if (sendSharedAuthErrors(response, error)) {
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

  if (sendSharedAuthErrors(response, error)) {
    return;
  }

  response.status(401).json({ error: 'Unauthorized' });
}

export function sendLearningErrorResponse(
  response: Response,
  error: unknown,
): void {
  if (error instanceof LearningInvalidInputError) {
    response.status(400).json({ error: error.message });
    return;
  }

  if (sendSharedAuthErrors(response, error)) {
    return;
  }

  response.status(401).json({ error: 'Unauthorized' });
}

export function sendGoalErrorResponse(
  response: Response,
  error: unknown,
): void {
  if (error instanceof GoalInvalidInputError) {
    response.status(400).json({ error: error.message });
    return;
  }

  if (error instanceof GoalNotFoundError) {
    response.status(404).json({ error: 'Not found' });
    return;
  }

  if (sendSharedAuthErrors(response, error)) {
    return;
  }

  response.status(401).json({ error: 'Unauthorized' });
}

export function sendReportErrorResponse(
  response: Response,
  error: unknown,
): void {
  if (error instanceof ReportInvalidInputError) {
    response.status(400).json({ error: error.message });
    return;
  }

  if (error instanceof ReportNotFoundError) {
    response.status(404).json({ error: 'Not found' });
    return;
  }

  if (sendSharedAuthErrors(response, error)) {
    return;
  }

  response.status(401).json({ error: 'Unauthorized' });
}

export function sendMessageErrorResponse(
  response: Response,
  error: unknown,
): void {
  if (error instanceof MessageThreadNotFoundError) {
    response.status(404).json({ error: 'Not found' });
    return;
  }

  if (
    error instanceof LegacyQuickReplyNotSupportedError ||
    error instanceof MessageContentRequiredError ||
    error instanceof MessageTemplateRequiredError ||
    error instanceof UnknownQuestionTemplateError ||
    error instanceof UnknownReplyTemplateError ||
    error instanceof UnknownStampError
  ) {
    response.status(400).json({ error: 'Bad request' });
    return;
  }

  if (sendSharedAuthErrors(response, error)) {
    return;
  }

  response.status(401).json({ error: 'Unauthorized' });
}
