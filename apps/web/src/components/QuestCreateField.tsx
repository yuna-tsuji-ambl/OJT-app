import type {
  QuestCreateFieldControlProps,
  QuestCreateFieldDefinition,
} from '../domain/questCreateFormFields';
import { QuestCreateLevelSelect } from './QuestCreateLevelSelect';
import { QuestCreateTextField } from './QuestCreateTextField';

interface QuestCreateFieldProps extends Pick<
  QuestCreateFieldControlProps,
  'value' | 'onChange'
> {
  field: QuestCreateFieldDefinition;
}

export function QuestCreateField({
  field,
  value,
  onChange,
}: QuestCreateFieldProps) {
  const controlProps: QuestCreateFieldControlProps = {
    label: field.label,
    inputId: field.inputId,
    value,
    onChange,
  };

  if (field.inputType === 'select') {
    return <QuestCreateLevelSelect {...controlProps} />;
  }

  return <QuestCreateTextField {...controlProps} />;
}
