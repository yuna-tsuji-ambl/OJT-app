import {
  QUEST_ACHIEVEMENT_LEVEL_OPTIONS,
  QUEST_ACHIEVEMENT_LEVEL_PLACEHOLDER,
  type QuestCreateFieldControlProps,
} from '../domain/questCreateFormFields';
import { QuestCreateFieldRow } from './QuestCreateFieldRow';

export function QuestCreateLevelSelect({
  label,
  inputId,
  value,
  onChange,
}: QuestCreateFieldControlProps) {
  return (
    <QuestCreateFieldRow label={label} inputId={inputId}>
      <select
        id={inputId}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required
      >
        <option value="" disabled>
          {QUEST_ACHIEVEMENT_LEVEL_PLACEHOLDER}
        </option>
        {QUEST_ACHIEVEMENT_LEVEL_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </QuestCreateFieldRow>
  );
}
