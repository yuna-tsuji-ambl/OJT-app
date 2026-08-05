import type { Request } from 'express';
import { GOAL_STATUSES, type GoalStatus } from '../goals/goalConstants.js';
import type {
  CreateGoalInput,
  ListGoalsQuery,
  UpdateGoalInput,
} from '../goals/goalTypes.js';

function readOptionalString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function readOptionalNumber(value: unknown): number | undefined {
  return typeof value === 'number' ? value : undefined;
}

function isGoalStatus(value: unknown): value is GoalStatus {
  return (
    typeof value === 'string' &&
    (GOAL_STATUSES as readonly string[]).includes(value)
  );
}

export function parseListGoalsQuery(query: Request['query']): ListGoalsQuery {
  const traineeId = readOptionalString(query.traineeId);
  return traineeId ? { traineeId } : {};
}

export function parseCreateGoalBody(body: unknown): CreateGoalInput | null {
  if (!body || typeof body !== 'object') {
    return null;
  }

  const record = body as Record<string, unknown>;
  const title = readOptionalString(record.title);
  const startDate = readOptionalString(record.startDate);
  const endDate = readOptionalString(record.endDate);

  if (!title || !startDate || !endDate) {
    return null;
  }

  const input: CreateGoalInput = {
    title,
    startDate,
    endDate,
  };

  const traineeId = readOptionalString(record.traineeId);
  const description = readOptionalString(record.description);
  const progress = readOptionalNumber(record.progress);
  const hasStatus = 'status' in record;
  const status = isGoalStatus(record.status) ? record.status : undefined;

  if (hasStatus && status === undefined) {
    return null;
  }

  if (traineeId !== undefined) {
    input.traineeId = traineeId;
  }

  if (description !== undefined) {
    input.description = description;
  }

  if (progress !== undefined) {
    input.progress = progress;
  }

  if (status !== undefined) {
    input.status = status;
  }

  return input;
}

export function parseUpdateGoalBody(body: unknown): UpdateGoalInput | null {
  if (!body || typeof body !== 'object') {
    return null;
  }

  const record = body as Record<string, unknown>;
  const input: UpdateGoalInput = {};

  const title = readOptionalString(record.title);
  const description = readOptionalString(record.description);
  const startDate = readOptionalString(record.startDate);
  const endDate = readOptionalString(record.endDate);
  const progress = readOptionalNumber(record.progress);
  const hasStatus = 'status' in record;
  const status = isGoalStatus(record.status) ? record.status : undefined;

  if (hasStatus && status === undefined) {
    return null;
  }

  if (title !== undefined) {
    input.title = title;
  }

  if (description !== undefined) {
    input.description = description;
  }

  if (startDate !== undefined) {
    input.startDate = startDate;
  }

  if (endDate !== undefined) {
    input.endDate = endDate;
  }

  if (progress !== undefined) {
    input.progress = progress;
  }

  if (status !== undefined) {
    input.status = status;
  }

  if (Object.keys(input).length === 0) {
    return null;
  }

  return input;
}
