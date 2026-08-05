import type {
  CreateAssignmentInput,
  UpdateAssignmentInput,
} from '../domain/assignmentTypes.js';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readNonEmptyString(
  body: Record<string, unknown>,
  field: 'traineeId' | 'majorItem' | 'title' | 'description',
): string | null {
  const value = body[field];

  if (typeof value !== 'string' || value.trim() === '') {
    return null;
  }

  return value.trim();
}

function readOptionalString(
  body: Record<string, unknown>,
  field: 'dueDate',
): string | undefined {
  const value = body[field];

  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== 'string' || value.trim() === '') {
    return undefined;
  }

  return value.trim();
}

function readAchievementLevel(body: Record<string, unknown>): string | null {
  const value = body.achievementLevel;

  if (typeof value === 'number' && Number.isInteger(value)) {
    return String(value);
  }

  if (typeof value === 'string' && value.trim() !== '') {
    return value.trim();
  }

  return null;
}

export function parseCreateAssignmentBody(
  body: unknown,
): CreateAssignmentInput | null {
  if (!isRecord(body)) {
    return null;
  }

  const traineeId = readNonEmptyString(body, 'traineeId');
  const majorItem = readNonEmptyString(body, 'majorItem');
  const title = readNonEmptyString(body, 'title');
  const description =
    typeof body.description === 'string' ? body.description.trim() : null;
  const achievementLevel = readAchievementLevel(body);

  if (
    !traineeId ||
    !majorItem ||
    !title ||
    description === null ||
    !achievementLevel
  ) {
    return null;
  }

  return {
    traineeId,
    majorItem,
    title,
    description,
    achievementLevel,
    dueDate: readOptionalString(body, 'dueDate'),
  };
}

export function parseUpdateAssignmentBody(
  body: unknown,
): UpdateAssignmentInput | null {
  if (!isRecord(body)) {
    return null;
  }

  const input: UpdateAssignmentInput = {};

  if (body.majorItem !== undefined) {
    const majorItem = readNonEmptyString(body, 'majorItem');
    if (!majorItem) {
      return null;
    }
    input.majorItem = majorItem;
  }

  if (body.title !== undefined) {
    const title = readNonEmptyString(body, 'title');
    if (!title) {
      return null;
    }
    input.title = title;
  }

  if (body.description !== undefined) {
    const description = readNonEmptyString(body, 'description');
    if (!description) {
      return null;
    }
    input.description = description;
  }

  if (body.achievementLevel !== undefined) {
    const achievementLevel = readAchievementLevel(body);
    if (!achievementLevel) {
      return null;
    }
    input.achievementLevel = achievementLevel;
  }

  if (body.dueDate !== undefined) {
    input.dueDate = readOptionalString(body, 'dueDate');
  }

  if (Object.keys(input).length === 0) {
    return null;
  }

  return input;
}
