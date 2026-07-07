import type { Quest } from '@ojt-app/shared';
import { canApproveQuest } from '../domain/questDisplay';
import { QuestArticleCard } from './QuestArticleCard';

interface TrainerQuestProgressCardProps {
  quest: Quest;
  onApprove?: (questId: string) => void;
}

export function TrainerQuestProgressCard({
  quest,
  onApprove,
}: TrainerQuestProgressCardProps) {
  const showApprove = canApproveQuest(quest) && onApprove !== undefined;

  return (
    <QuestArticleCard quest={quest}>
      {showApprove ? (
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => onApprove(quest.id)}
        >
          承認
        </button>
      ) : null}
    </QuestArticleCard>
  );
}
