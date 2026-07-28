import { normalizeAchievementLevel } from './achievementLevel.js';
import { QUEST_STATUS } from './constants.js';
import type { Assignment, CreateAssignmentInput } from './assignmentTypes.js';

export function buildAssignment(
  id: string,
  input: CreateAssignmentInput,
  createdBy: string,
  timestamps: { createdAt: string; updatedAt: string },
): Assignment {
  return {
    id,
    traineeId: input.traineeId,
    createdBy,
    majorItem: input.majorItem,
    title: input.title,
    description: input.description,
    achievementLevel: normalizeAchievementLevel(input.achievementLevel),
    dueDate: input.dueDate,
    status: QUEST_STATUS.NOT_CLEARED,
    createdAt: timestamps.createdAt,
    updatedAt: timestamps.updatedAt,
  };
}

export function createAssignmentFromInput(
  input: CreateAssignmentInput,
  createdBy: string,
): Assignment {
  const now = new Date().toISOString();
  return buildAssignment(crypto.randomUUID(), input, createdBy, {
    createdAt: now,
    updatedAt: now,
  });
}
