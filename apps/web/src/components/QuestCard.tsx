import type { Quest } from '@ojt-app/shared';
import {
  canRequestQuestClear,
  isQuestCleared,
  QUEST_CLEARED_LABEL,
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
      {isQuestCleared(quest) ? <p>{QUEST_CLEARED_LABEL}</p> : null}
      {onRequest && canRequestQuestClear(quest) ? (
        <button type="button" className="btn btn-primary" onClick={() => onRequest(quest.id)}>
          申請
        </button>
      ) : null}
    </article>
  );
}
