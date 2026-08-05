import type { CreateQuestInput } from '@ojt-app/shared';
import { buildAchievementLevelOptionValues } from '@ojt-app/shared';

export const QUEST_CREATE_REGION_LABEL = 'クエスト作成' as const;
export const QUEST_CREATE_SUBMIT_LABEL = '作成' as const;
export const QUEST_ACHIEVEMENT_LEVEL_PLACEHOLDER = '選択してください' as const;

export type QuestCreateFieldKey = keyof CreateQuestInput;

export type QuestCreateFieldInputType = 'text' | 'select';

export interface QuestCreateFieldControlProps {
  label: string;
  inputId: string;
  value: string;
  onChange: (value: string) => void;
}

export interface QuestCreateFieldDefinition {
  key: QuestCreateFieldKey;
  label: string;
  inputId: string;
  inputType: QuestCreateFieldInputType;
}

export const QUEST_ACHIEVEMENT_LEVEL_OPTIONS =
  buildAchievementLevelOptionValues();

export const QUEST_CREATE_FIELDS: readonly QuestCreateFieldDefinition[] = [
  {
    key: 'majorItem',
    label: 'タイトル',
    inputId: 'quest-title',
    inputType: 'text',
  },
  {
    key: 'minorItem',
    label: 'コメント',
    inputId: 'quest-comment',
    inputType: 'text',
  },
  {
    key: 'achievementLevel',
    label: '到達レベル',
    inputId: 'quest-achievement-level',
    inputType: 'select',
  },
] as const;
