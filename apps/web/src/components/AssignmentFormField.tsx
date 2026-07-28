import type { AssignmentFormFieldDefinition } from '../domain/assignmentFormFields';
import { QuestCreateLevelSelect } from './QuestCreateLevelSelect';
import { QuestCreateTextField } from './QuestCreateTextField';

interface AssignmentFormFieldProps {
  field: AssignmentFormFieldDefinition;
  value: string;
  onChange: (value: string) => void;
}

export function AssignmentFormField({
  field,
  value,
  onChange,
}: AssignmentFormFieldProps) {
  const controlProps = {
    label: field.label,
    inputId: field.inputId,
    value,
    onChange,
  };

  if (field.inputType === 'select') {
    return <QuestCreateLevelSelect {...controlProps} />;
  }

  if (field.key === 'description' || field.inputType === 'date') {
    return (
      <QuestCreateTextField
        {...controlProps}
        inputType={field.inputType === 'date' ? 'date' : 'text'}
        required={false}
      />
    );
  }

  return <QuestCreateTextField {...controlProps} />;
}
