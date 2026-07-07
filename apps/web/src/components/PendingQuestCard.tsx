import type { Quest } from '@ojt-app/shared';
import { QuestArticleCard } from './QuestArticleCard';

interface PendingQuestCardProps {
  quest: Quest;
  onApprove: (questId: string) => void;
}

export function PendingQuestCard({ quest, onApprove }: PendingQuestCardProps) {
  return (
    <QuestArticleCard quest={quest}>
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => onApprove(quest.id)}
      >
        承認
      </button>
    </QuestArticleCard>
  );
}
