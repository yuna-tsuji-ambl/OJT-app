import type { Quest } from '@ojt-app/shared';
import { QUEST_STATUS } from '@ojt-app/shared';
import { formatQuestStatus } from '../domain/questDisplay';

interface TrainerQuestProgressCardProps {
  quest: Quest;
  onApprove?: (questId: string) => void;
}

export function TrainerQuestProgressCard({
  quest,
  onApprove,
}: TrainerQuestProgressCardProps) {
  const showApprove =
    quest.status === QUEST_STATUS.PENDING && onApprove !== undefined;

  return (
    <article aria-label={quest.minorItem}>
      <p>{quest.minorItem}</p>
      <p>{formatQuestStatus(quest)}</p>
      {showApprove ? (
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => onApprove(quest.id)}
        >
          承認
        </button>
      ) : null}
    </article>
  );
}
