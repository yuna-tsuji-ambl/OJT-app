import type { Assignment } from '@ojt-app/shared';
import {
  formatAssignmentAchievementLevel,
  formatAssignmentDescription,
  formatAssignmentDueDate,
  formatAssignmentMajorItem,
  formatAssignmentStatus,
  formatAssignmentTitle,
} from '../domain/assignmentDisplay';

interface AssignmentDisplayContentProps {
  assignment: Assignment;
}

export function AssignmentDisplayContent({
  assignment,
}: AssignmentDisplayContentProps) {
  return (
    <>
      <p>{formatAssignmentMajorItem(assignment)}</p>
      <p>{formatAssignmentTitle(assignment)}</p>
      <p>{formatAssignmentDescription(assignment)}</p>
      <p>{formatAssignmentAchievementLevel(assignment)}</p>
      <p>{formatAssignmentDueDate(assignment)}</p>
      <p>{formatAssignmentStatus(assignment)}</p>
    </>
  );
}
