import type { CreateQuestInput } from '../domain/questTypes.js';
import { isUnknownRecord } from './requestParsing.js';

function readNonEmptyString(
  body: Record<string, unknown>,
  field: 'majorItem' | 'minorItem',
): string | null {
  const value = body[field];

  if (typeof value !== 'string' || value.trim() === '') {
    return null;
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

export function parseCreateQuestBody(body: unknown): CreateQuestInput | null {
  if (!isUnknownRecord(body)) {
    return null;
  }

  const majorItem = readNonEmptyString(body, 'majorItem');
  const minorItem = readNonEmptyString(body, 'minorItem');
  const achievementLevel = readAchievementLevel(body);

  if (!majorItem || !minorItem || !achievementLevel) {
    return null;
  }

  return { majorItem, minorItem, achievementLevel };
}
