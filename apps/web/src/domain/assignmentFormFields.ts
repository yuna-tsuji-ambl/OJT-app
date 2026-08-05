import type {
  CreateAssignmentInput,
  UpdateAssignmentInput,
} from '@ojt-app/shared';
import { buildAchievementLevelOptionValues } from '@ojt-app/shared';
import { DEFAULT_TRAINEE_ID } from './assignmentConstants';

export const ASSIGNMENT_CREATE_REGION_LABEL = '課題作成' as const;
export const ASSIGNMENT_EDIT_REGION_LABEL = '課題編集' as const;
export const ASSIGNMENT_CREATE_SUBMIT_LABEL = '作成' as const;
export const ASSIGNMENT_UPDATE_SUBMIT_LABEL = '保存' as const;
export const ASSIGNMENT_ACHIEVEMENT_LEVEL_PLACEHOLDER =
  '選択してください' as const;

export type AssignmentFormFieldKey = keyof CreateAssignmentInput | 'dueDate';

export type AssignmentFormFieldInputType = 'text' | 'select' | 'date';

export interface AssignmentFormFieldControlProps {
  label: string;
  inputId: string;
  value: string;
  onChange: (value: string) => void;
}

export interface AssignmentFormFieldDefinition {
  key: AssignmentFormFieldKey;
  label: string;
  inputId: string;
  inputType: AssignmentFormFieldInputType;
}

export const ASSIGNMENT_ACHIEVEMENT_LEVEL_OPTIONS =
  buildAchievementLevelOptionValues();

export const ASSIGNMENT_FORM_FIELDS: readonly AssignmentFormFieldDefinition[] =
  [
    {
      key: 'majorItem',
      label: '大項目',
      inputId: 'assignment-major-item',
      inputType: 'text',
    },
    {
      key: 'title',
      label: 'タイトル',
      inputId: 'assignment-title',
      inputType: 'text',
    },
    {
      key: 'description',
      label: '説明',
      inputId: 'assignment-description',
      inputType: 'text',
    },
    {
      key: 'achievementLevel',
      label: '到達レベル',
      inputId: 'assignment-achievement-level',
      inputType: 'select',
    },
    {
      key: 'dueDate',
      label: '期限',
      inputId: 'assignment-due-date',
      inputType: 'date',
    },
  ] as const;

export const EMPTY_ASSIGNMENT_DRAFT: CreateAssignmentInput = {
  traineeId: DEFAULT_TRAINEE_ID,
  majorItem: '',
  title: '',
  description: '',
  achievementLevel: '',
};

export function toUpdateAssignmentInput(
  draft: CreateAssignmentInput,
): UpdateAssignmentInput {
  return {
    majorItem: draft.majorItem,
    title: draft.title,
    description: draft.description,
    achievementLevel: draft.achievementLevel,
    dueDate: draft.dueDate,
  };
}
