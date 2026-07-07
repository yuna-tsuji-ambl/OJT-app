import type { CreateQuestInput } from '../domain/questTypes.js';

function readNonEmptyString(
  body: Record<string, unknown>,
  field: keyof CreateQuestInput,
): string | null {
  const value = body[field];

  if (typeof value !== 'string' || value.trim() === '') {
    return null;
  }

  return value.trim();
}

export function parseCreateQuestBody(body: unknown): CreateQuestInput | null {
  if (typeof body !== 'object' || body === null) {
    return null;
  }

  const record = body as Record<string, unknown>;
  const majorItem = readNonEmptyString(record, 'majorItem');
  const minorItem = readNonEmptyString(record, 'minorItem');
  const achievementLevel = readNonEmptyString(record, 'achievementLevel');

  if (!majorItem || !minorItem || !achievementLevel) {
    return null;
  }

  return { majorItem, minorItem, achievementLevel };
}
