import type { Quest } from '@ojt-app/shared';
import type { ReactNode } from 'react';
import { QuestDisplayContent } from './QuestDisplayContent';

interface QuestArticleCardProps {
  quest: Quest;
  children?: ReactNode;
}

export function QuestArticleCard({ quest, children }: QuestArticleCardProps) {
  return (
    <article aria-label={quest.minorItem}>
      <QuestDisplayContent quest={quest} />
      {children}
    </article>
  );
}
