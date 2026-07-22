import type { CreateAssignmentInput } from '@ojt-app/shared';
import type { FormEvent } from 'react';
import { useId } from 'react';
import {
  ASSIGNMENT_CREATE_SUBMIT_LABEL,
  ASSIGNMENT_FORM_FIELDS,
  ASSIGNMENT_UPDATE_SUBMIT_LABEL,
} from '../domain/assignmentFormFields';
import { useAssignmentCreateDraft } from '../hooks/useAssignmentCreateDraft';
import { AssignmentFormField } from './AssignmentFormField';

interface AssignmentFormProps {
  regionLabel: string;
  submitLabel?: string;
  initialDraft?: CreateAssignmentInput;
  onSubmit: (input: CreateAssignmentInput) => Promise<void>;
  onCancel?: () => void;
}

export function AssignmentForm({
  regionLabel,
  submitLabel,
  initialDraft,
  onSubmit,
  onCancel,
}: AssignmentFormProps) {
  const formInstanceId = useId();
  const { draft, updateField, resetDraft } =
    useAssignmentCreateDraft(initialDraft);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    await onSubmit(draft);
    resetDraft();
  }

  const resolvedSubmitLabel =
    submitLabel ??
    (onCancel
      ? ASSIGNMENT_UPDATE_SUBMIT_LABEL
      : ASSIGNMENT_CREATE_SUBMIT_LABEL);

  return (
    <section
      role="region"
      aria-label={regionLabel}
      className="dashboard-region"
    >
      <h2>{regionLabel}</h2>
      <form onSubmit={(event) => void handleSubmit(event)}>
        {ASSIGNMENT_FORM_FIELDS.map((field) => (
          <AssignmentFormField
            key={field.key}
            field={{
              ...field,
              inputId: `${formInstanceId}-${field.inputId}`,
            }}
            value={draft[field.key as keyof CreateAssignmentInput] ?? ''}
            onChange={(value) =>
              updateField(field.key as keyof CreateAssignmentInput, value)
            }
          />
        ))}

        <div className="btn-group">
          <button type="submit" className="btn btn-primary">
            {resolvedSubmitLabel}
          </button>
          {onCancel ? (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
            >
              キャンセル
            </button>
          ) : null}
        </div>
      </form>
    </section>
  );
}
