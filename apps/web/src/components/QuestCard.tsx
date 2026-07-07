import type { Quest } from '@ojt-app/shared';
import { canRequestQuestClear } from '../domain/questDisplay';
import { QuestArticleCard } from './QuestArticleCard';

interface QuestCardProps {
  quest: Quest;
  onRequest?: (questId: string) => void;
}

export function QuestCard({ quest, onRequest }: QuestCardProps) {
  return (
    <QuestArticleCard quest={quest}>
      {onRequest && canRequestQuestClear(quest) ? (
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => onRequest(quest.id)}
        >
          申請
        </button>
      ) : null}
    </QuestArticleCard>
  );
}
