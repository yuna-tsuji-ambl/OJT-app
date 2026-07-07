import type { Quest } from '@ojt-app/shared';
import {
  formatQuestAchievementLevel,
  formatQuestComment,
  formatQuestStatus,
  formatQuestTitle,
} from '../domain/questDisplay';

interface QuestDisplayContentProps {
  quest: Quest;
}

export function QuestDisplayContent({ quest }: QuestDisplayContentProps) {
  return (
    <>
      <p>{formatQuestTitle(quest)}</p>
      <p>{formatQuestComment(quest)}</p>
      <p>{formatQuestAchievementLevel(quest)}</p>
      <p>{formatQuestStatus(quest)}</p>
    </>
  );
}
