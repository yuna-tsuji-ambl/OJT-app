import type { CreateQuestInput } from '@ojt-app/shared';
import { useState, type FormEvent } from 'react';
import { EMPTY_QUEST_CREATE_DRAFT } from '../domain/questCreateDraft';

interface QuestCreateFormProps {
  onCreate: (input: CreateQuestInput) => Promise<void>;
}

export function QuestCreateForm({ onCreate }: QuestCreateFormProps) {
  const [draft, setDraft] = useState<CreateQuestInput>(
    EMPTY_QUEST_CREATE_DRAFT,
  );

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    await onCreate(draft);
    setDraft(EMPTY_QUEST_CREATE_DRAFT);
  }

  function updateDraft(field: keyof CreateQuestInput, value: string): void {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  return (
    <section className="page-section" role="region" aria-label="クエスト作成">
      <h2>クエスト作成</h2>
      <form onSubmit={(event) => void handleSubmit(event)}>
        <label htmlFor="quest-major-item">大項目</label>
        <input
          id="quest-major-item"
          value={draft.majorItem}
          onChange={(event) => updateDraft('majorItem', event.target.value)}
          required
        />

        <label htmlFor="quest-minor-item">小項目</label>
        <input
          id="quest-minor-item"
          value={draft.minorItem}
          onChange={(event) => updateDraft('minorItem', event.target.value)}
          required
        />

        <label htmlFor="quest-achievement-level">到達レベル</label>
        <input
          id="quest-achievement-level"
          value={draft.achievementLevel}
          onChange={(event) =>
            updateDraft('achievementLevel', event.target.value)
          }
          required
        />

        <button type="submit" className="btn btn-primary">
          作成
        </button>
      </form>
    </section>
  );
}
