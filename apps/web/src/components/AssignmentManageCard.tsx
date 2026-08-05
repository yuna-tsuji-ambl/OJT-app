import type { Assignment, CreateAssignmentInput } from '@ojt-app/shared';
import { useState } from 'react';
import { ASSIGNMENT_EDIT_REGION_LABEL } from '../domain/assignmentFormFields';
import { canApproveAssignment } from '../domain/assignmentDisplay';
import { AssignmentArticleCard } from './AssignmentArticleCard';
import { AssignmentForm } from './AssignmentForm';

interface AssignmentManageCardProps {
  assignment: Assignment;
  onUpdate: (
    assignmentId: string,
    input: CreateAssignmentInput,
  ) => Promise<void>;
  onDelete: (assignmentId: string) => Promise<void>;
  onApprove?: (assignmentId: string) => void;
}

function toDraft(assignment: Assignment): CreateAssignmentInput {
  return {
    traineeId: assignment.traineeId,
    majorItem: assignment.majorItem,
    title: assignment.title,
    description: assignment.description,
    achievementLevel: assignment.achievementLevel,
    dueDate: assignment.dueDate,
  };
}

export function AssignmentManageCard({
  assignment,
  onUpdate,
  onDelete,
  onApprove,
}: AssignmentManageCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <AssignmentForm
        regionLabel={ASSIGNMENT_EDIT_REGION_LABEL}
        initialDraft={toDraft(assignment)}
        onSubmit={async (input) => {
          await onUpdate(assignment.id, input);
          setIsEditing(false);
        }}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  const showApprove =
    canApproveAssignment(assignment) && onApprove !== undefined;

  return (
    <AssignmentArticleCard assignment={assignment}>
      <div className="btn-group">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setIsEditing(true)}
        >
          編集
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => void onDelete(assignment.id)}
        >
          削除
        </button>
        {showApprove ? (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => onApprove(assignment.id)}
          >
            承認
          </button>
        ) : null}
      </div>
    </AssignmentArticleCard>
  );
}
