import { GoalInvalidInputError } from '../domain/errors.js';
import {
  GOAL_DESCRIPTION_MAX_LENGTH,
  GOAL_PROGRESS_MAX,
  GOAL_PROGRESS_MIN,
  GOAL_STATUSES,
  GOAL_TITLE_MAX_LENGTH,
  type GoalStatus,
} from './goalConstants.js';
import {
  isValidGoalDateRange,
  isValidIsoDateString,
} from './goalDateValidation.js';
import type { CreateGoalInput, UpdateGoalInput } from './goalTypes.js';

function rejectInvalidInput(): never {
  throw new GoalInvalidInputError();
}

function isGoalStatus(value: unknown): value is GoalStatus {
  return (
    typeof value === 'string' &&
    (GOAL_STATUSES as readonly string[]).includes(value)
  );
}

function validateTitle(title: unknown): asserts title is string {
  if (typeof title !== 'string') {
    rejectInvalidInput();
  }
  if (title.trim().length === 0) {
    rejectInvalidInput();
  }
  if (title.length > GOAL_TITLE_MAX_LENGTH) {
    rejectInvalidInput();
  }
}

function validateOptionalDescription(description: unknown): void {
  if (description === undefined) {
    return;
  }

  if (typeof description !== 'string') {
    rejectInvalidInput();
  }
  if (description.length > GOAL_DESCRIPTION_MAX_LENGTH) {
    rejectInvalidInput();
  }
}

function validateProgress(progress: unknown): asserts progress is number {
  if (typeof progress !== 'number' || !Number.isFinite(progress)) {
    rejectInvalidInput();
  }
  if (progress < GOAL_PROGRESS_MIN || progress > GOAL_PROGRESS_MAX) {
    rejectInvalidInput();
  }
}

function validateDatePair(startDate: unknown, endDate: unknown): void {
  if (typeof startDate !== 'string' || typeof endDate !== 'string') {
    rejectInvalidInput();
  }
  if (!isValidIsoDateString(startDate)) {
    rejectInvalidInput();
  }
  if (!isValidIsoDateString(endDate)) {
    rejectInvalidInput();
  }
  if (!isValidGoalDateRange(startDate, endDate)) {
    rejectInvalidInput();
  }
}

export function validateCreateGoalInput(input: CreateGoalInput): void {
  validateTitle(input.title);
  validateOptionalDescription(input.description);

  if (input.traineeId !== undefined) {
    if (typeof input.traineeId !== 'string' || input.traineeId.length === 0) {
      rejectInvalidInput();
    }
  }

  validateDatePair(input.startDate, input.endDate);

  if (input.progress !== undefined) {
    validateProgress(input.progress);
  }

  if (input.status !== undefined && !isGoalStatus(input.status)) {
    rejectInvalidInput();
  }
}

export function validateUpdateGoalInput(
  input: UpdateGoalInput,
  existing: { startDate: string; endDate: string },
): void {
  if (input.title !== undefined) {
    validateTitle(input.title);
  }

  validateOptionalDescription(input.description);

  const startDate = input.startDate ?? existing.startDate;
  const endDate = input.endDate ?? existing.endDate;

  if (input.startDate !== undefined || input.endDate !== undefined) {
    validateDatePair(startDate, endDate);
  }

  if (input.progress !== undefined) {
    validateProgress(input.progress);
  }

  if (input.status !== undefined && !isGoalStatus(input.status)) {
    rejectInvalidInput();
  }
}
