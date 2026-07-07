import type { Quest } from '@ojt-app/shared';
import { formatQuestStatus } from '../domain/questDisplay';

interface TrainerQuestProgressCardProps {
  quest: Quest;
}

export function TrainerQuestProgressCard({
  quest,
}: TrainerQuestProgressCardProps) {
  return (
    <article aria-label={quest.minorItem}>
      <p>{quest.minorItem}</p>
      <p>{formatQuestStatus(quest)}</p>
    </article>
  );
}
