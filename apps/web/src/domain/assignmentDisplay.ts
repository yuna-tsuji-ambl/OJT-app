import type { Assignment, Quest } from '@ojt-app/shared';
import { QUEST_STATUS } from '@ojt-app/shared';

export const ASSIGNMENT_CLEARED_LABEL = 'クリア（承認済み）' as const;

export function assignmentToQuest(assignment: Assignment): Quest {
  return {
    id: assignment.id,
    majorItem: assignment.majorItem,
    minorItem: assignment.title,
    achievementLevel: assignment.achievementLevel,
    status: assignment.status,
  };
}

export function formatAssignmentMajorItem(assignment: Assignment): string {
  return assignment.majorItem;
}

export function formatAssignmentTitle(assignment: Assignment): string {
  return assignment.title;
}

export function formatAssignmentDescription(assignment: Assignment): string {
  return assignment.description;
}

export function formatAssignmentAchievementLevel(
  assignment: Assignment,
): string {
  return assignment.achievementLevel;
}

export function formatAssignmentDueDate(assignment: Assignment): string {
  return assignment.dueDate ?? '—';
}

export function formatAssignmentStatus(assignment: Assignment): string {
  if (assignment.status === QUEST_STATUS.CLEARED) {
    return ASSIGNMENT_CLEARED_LABEL;
  }

  if (assignment.status === QUEST_STATUS.PENDING) {
    return QUEST_STATUS.PENDING;
  }

  return QUEST_STATUS.NOT_CLEARED;
}

export function canRequestAssignmentClear(assignment: Assignment): boolean {
  return assignment.status === QUEST_STATUS.NOT_CLEARED;
}

export function canApproveAssignment(assignment: Assignment): boolean {
  return assignment.status === QUEST_STATUS.PENDING;
}
