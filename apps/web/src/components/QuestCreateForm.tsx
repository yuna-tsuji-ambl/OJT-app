import type { CreateQuestInput } from '@ojt-app/shared';
import type { FormEvent } from 'react';
import {
  QUEST_CREATE_FIELDS,
  QUEST_CREATE_REGION_LABEL,
  QUEST_CREATE_SUBMIT_LABEL,
} from '../domain/questCreateFormFields';
import { useQuestCreateDraft } from '../hooks/useQuestCreateDraft';
import { QuestCreateField } from './QuestCreateField';

interface QuestCreateFormProps {
  onCreate: (input: CreateQuestInput) => Promise<void>;
}

export function QuestCreateForm({ onCreate }: QuestCreateFormProps) {
  const { draft, updateField, resetDraft } = useQuestCreateDraft();

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    await onCreate(draft);
    resetDraft();
  }

  return (
    <section
      role="region"
      aria-label={QUEST_CREATE_REGION_LABEL}
      className="dashboard-region"
    >
      <h2>{QUEST_CREATE_REGION_LABEL}</h2>
      <form onSubmit={(event) => void handleSubmit(event)}>
        {QUEST_CREATE_FIELDS.map((field) => (
          <QuestCreateField
            key={field.key}
            field={field}
            value={draft[field.key]}
            onChange={(value) => updateField(field.key, value)}
          />
        ))}

        <div className="btn-group">
          <button type="submit" className="btn btn-primary">
            {QUEST_CREATE_SUBMIT_LABEL}
          </button>
        </div>
      </form>
    </section>
  );
}
