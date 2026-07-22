import type { CreateQuestInput } from './questTypes.js';
import type { Quest } from './types.js';
import type { Assignment, CreateAssignmentInput } from './assignmentTypes.js';
import { DEFAULT_TRAINEE_ID } from './userIds.js';
import { normalizeCreateQuestInput } from './achievementLevel.js';

export function assignmentToQuest(assignment: Assignment): Quest {
  return {
    id: assignment.id,
    majorItem: assignment.majorItem,
    minorItem: assignment.title,
    achievementLevel: assignment.achievementLevel,
    status: assignment.status,
  };
}

export function createAssignmentInputFromQuestInput(
  input: CreateQuestInput,
  traineeId: string = DEFAULT_TRAINEE_ID,
): CreateAssignmentInput {
  const normalized = normalizeCreateQuestInput(input);

  return {
    traineeId,
    majorItem: normalized.majorItem,
    title: normalized.minorItem,
    description: '',
    achievementLevel: normalized.achievementLevel,
  };
}
