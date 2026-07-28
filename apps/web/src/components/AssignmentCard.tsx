import type { Quest } from '@ojt-app/shared';
import { canRequestQuestClear } from '../domain/questDisplay';
import { QuestArticleCard } from './QuestArticleCard';

interface AssignmentCardProps {
  assignment: Quest;
  onRequest?: (assignmentId: string) => void;
}

export function AssignmentCard({ assignment, onRequest }: AssignmentCardProps) {
  return (
    <QuestArticleCard quest={assignment}>
      {onRequest && canRequestQuestClear(assignment) ? (
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => onRequest(assignment.id)}
        >
          申請
        </button>
      ) : null}
    </QuestArticleCard>
  );
}
