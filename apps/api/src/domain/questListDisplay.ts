import { isFormattedAchievementLevel } from './achievementLevel.js';
import {
  QuestAchievementLevelFormatError,
  QuestCommentRequiredError,
  QuestTitleRequiredError,
} from './errors.js';
import type { Quest } from './types.js';

export function requireQuestTitle(quest: Quest): Quest {
  if (quest.majorItem.trim() === '') {
    throw new QuestTitleRequiredError(quest.id);
  }

  return quest;
}

function requireQuestComment(quest: Quest): Quest {
  if (quest.minorItem.trim() === '') {
    throw new QuestCommentRequiredError(quest.id);
  }

  return quest;
}

function requireFormattedAchievementLevel(quest: Quest): Quest {
  if (!isFormattedAchievementLevel(quest.achievementLevel)) {
    throw new QuestAchievementLevelFormatError(quest.id);
  }

  return quest;
}

export function requireQuestDisplayFields(quest: Quest): Quest {
  return requireFormattedAchievementLevel(
    requireQuestComment(requireQuestTitle(quest)),
  );
}

export function mapTrainerQuestProgressList(quests: Quest[]): Quest[] {
  return quests.map(requireQuestTitle);
}

export function mapTraineeQuestList(quests: Quest[]): Quest[] {
  return quests.map(requireQuestDisplayFields);
}
