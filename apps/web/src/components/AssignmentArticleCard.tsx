import type { Assignment } from '@ojt-app/shared';
import type { ReactNode } from 'react';
import { AssignmentDisplayContent } from './AssignmentDisplayContent';

interface AssignmentArticleCardProps {
  assignment: Assignment;
  children?: ReactNode;
}

export function AssignmentArticleCard({
  assignment,
  children,
}: AssignmentArticleCardProps) {
  return (
    <article aria-label={assignment.title}>
      <AssignmentDisplayContent assignment={assignment} />
      {children}
    </article>
  );
}
