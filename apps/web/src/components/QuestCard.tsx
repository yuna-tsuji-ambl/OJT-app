import type { Quest } from '@ojt-app/shared';
import {
  canRequestQuestClear,
  formatQuestStatus,
} from '../domain/questDisplay';

interface QuestCardProps {
  quest: Quest;
  onRequest?: (questId: string) => void;
}

export function QuestCard({ quest, onRequest }: QuestCardProps) {
  return (
    <article aria-label={quest.minorItem}>
      <p>{quest.majorItem}</p>
      <p>{quest.minorItem}</p>
      <p>{quest.achievementLevel}</p>
      <p>{formatQuestStatus(quest)}</p>
      {onRequest && canRequestQuestClear(quest) ? (
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => onRequest(quest.id)}
        >
          申請
        </button>
      ) : null}
    </article>
  );
}
