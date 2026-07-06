import type { Quest } from '@ojt-app/shared';

interface PendingQuestCardProps {
  quest: Quest;
  onApprove: (questId: string) => void;
}

export function PendingQuestCard({ quest, onApprove }: PendingQuestCardProps) {
  return (
    <article aria-label={quest.minorItem}>
      <p>{quest.minorItem}</p>
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => onApprove(quest.id)}
      >
        承認
      </button>
    </article>
  );
}
