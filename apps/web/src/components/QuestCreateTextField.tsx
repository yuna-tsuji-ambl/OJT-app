import type { QuestCreateFieldControlProps } from '../domain/questCreateFormFields';
import { QuestCreateFieldRow } from './QuestCreateFieldRow';

export function QuestCreateTextField({
  label,
  inputId,
  value,
  onChange,
}: QuestCreateFieldControlProps) {
  return (
    <QuestCreateFieldRow label={label} inputId={inputId}>
      <input
        id={inputId}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required
      />
    </QuestCreateFieldRow>
  );
}
