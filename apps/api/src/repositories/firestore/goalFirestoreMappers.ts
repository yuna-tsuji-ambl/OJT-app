import type { DocumentData } from '@google-cloud/firestore';
import type { Goal } from '../../goals/goalTypes.js';

export type GoalDocument = Goal;

function includeDefinedField<K extends string, V>(
  key: K,
  value: V | undefined,
): Partial<Record<K, V>> {
  if (value === undefined) {
    return {};
  }

  return { [key]: value } as Partial<Record<K, V>>;
}

export function toGoalDocument(goal: Goal): GoalDocument {
  return {
    id: goal.id,
    traineeId: goal.traineeId,
    createdBy: goal.createdBy,
    title: goal.title,
    startDate: goal.startDate,
    endDate: goal.endDate,
    progress: goal.progress,
    status: goal.status,
    createdAt: goal.createdAt,
    updatedAt: goal.updatedAt,
    ...includeDefinedField('description', goal.description),
  };
}

export function fromGoalDocument(
  data: DocumentData | GoalDocument | undefined,
): Goal {
  if (!data) {
    throw new Error('Goal document data is required');
  }

  return toGoalDocument(data as GoalDocument);
}
