import type { QuestCreateFieldControlProps } from '../domain/questCreateFormFields';
import { QuestCreateFieldRow } from './QuestCreateFieldRow';

interface QuestCreateTextFieldProps extends QuestCreateFieldControlProps {
  inputType?: 'text' | 'date';
  required?: boolean;
}

export function QuestCreateTextField({
  label,
  inputId,
  value,
  onChange,
  inputType = 'text',
  required = true,
}: QuestCreateTextFieldProps) {
  return (
    <QuestCreateFieldRow label={label} inputId={inputId}>
      <input
        id={inputId}
        type={inputType}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
      />
    </QuestCreateFieldRow>
  );
}
