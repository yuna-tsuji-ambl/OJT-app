import type { Assignment } from '../../domain/assignmentTypes.js';

function includeDefinedField<K extends string, V>(
  key: K,
  value: V | undefined,
): Partial<Record<K, V>> {
  if (value === undefined) {
    return {};
  }

  return { [key]: value } as Partial<Record<K, V>>;
}

export function toAssignmentDocument(assignment: Assignment): Assignment {
  return {
    id: assignment.id,
    traineeId: assignment.traineeId,
    createdBy: assignment.createdBy,
    majorItem: assignment.majorItem,
    title: assignment.title,
    description: assignment.description,
    achievementLevel: assignment.achievementLevel,
    status: assignment.status,
    createdAt: assignment.createdAt,
    updatedAt: assignment.updatedAt,
    ...includeDefinedField('dueDate', assignment.dueDate),
  };
}

export function fromAssignmentDocument(data: unknown): Assignment {
  return toAssignmentDocument(data as Assignment);
}
