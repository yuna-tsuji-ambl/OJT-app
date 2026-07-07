import type { CreateQuestInput } from '@ojt-app/shared';
import { useState } from 'react';
import { EMPTY_QUEST_CREATE_DRAFT } from '../domain/questCreateDraft';
import type { QuestCreateFieldKey } from '../domain/questCreateFormFields';

export function useQuestCreateDraft() {
  const [draft, setDraft] = useState<CreateQuestInput>(
    EMPTY_QUEST_CREATE_DRAFT,
  );

  function updateField(field: QuestCreateFieldKey, value: string): void {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function resetDraft(): void {
    setDraft(EMPTY_QUEST_CREATE_DRAFT);
  }

  return { draft, updateField, resetDraft };
}
