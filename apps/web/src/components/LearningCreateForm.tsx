import { useState, type FormEvent } from 'react';
import {
  LEARNING_BODY_FIELD_LABEL,
  LEARNING_CREATE_SUBMIT_LABEL,
  LEARNING_DATE_FIELD_LABEL,
  LEARNING_TITLE_FIELD_LABEL,
  createEmptyLearningFormValues,
  toCreateLearningInput,
  validateLearningFormValues,
  type LearningFormValues,
} from '../domain/learningForm';
import { LinkInputList } from './LinkInputList';

interface LearningCreateFormProps {
  readonly regionLabel: string;
  readonly submitting?: boolean;
  readonly onSubmit: (
    values: ReturnType<typeof toCreateLearningInput>,
  ) => Promise<boolean>;
}

export function LearningCreateForm({
  regionLabel,
  submitting = false,
  onSubmit,
}: LearningCreateFormProps) {
  const fieldIdPrefix = 'learning-create';
  const titleFieldId = `${fieldIdPrefix}-title`;
  const bodyFieldId = `${fieldIdPrefix}-body`;
  const dateFieldId = `${fieldIdPrefix}-date`;

  const [values, setValues] = useState<LearningFormValues>(
    createEmptyLearningFormValues(),
  );
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = validateLearningFormValues(values);
    if (validationError) {
      setError(validationError);
      return;
    }

    const succeeded = await onSubmit(toCreateLearningInput(values));
    if (succeeded) {
      setValues(createEmptyLearningFormValues());
      setError(null);
    }
  };

  return (
    <form
      className="learning-form"
      aria-label={regionLabel}
      onSubmit={(event) => {
        void handleSubmit(event);
      }}
    >
      <div className="learning-form__field">
        <label htmlFor={titleFieldId}>{LEARNING_TITLE_FIELD_LABEL}</label>
        <input
          id={titleFieldId}
          type="text"
          value={values.title}
          onChange={(event) =>
            setValues((current) => ({ ...current, title: event.target.value }))
          }
        />
      </div>
      <div className="learning-form__field">
        <label htmlFor={bodyFieldId}>{LEARNING_BODY_FIELD_LABEL}</label>
        <textarea
          id={bodyFieldId}
          className="learning-form__textarea"
          value={values.body}
          rows={6}
          onChange={(event) =>
            setValues((current) => ({ ...current, body: event.target.value }))
          }
        />
      </div>
      <div className="learning-form__field">
        <label htmlFor={dateFieldId}>{LEARNING_DATE_FIELD_LABEL}</label>
        <input
          id={dateFieldId}
          type="date"
          value={values.date}
          onChange={(event) =>
            setValues((current) => ({ ...current, date: event.target.value }))
          }
        />
      </div>
      <LinkInputList
        links={values.links}
        fieldIdPrefix={fieldIdPrefix}
        onChange={(links) => setValues((current) => ({ ...current, links }))}
      />
      {error ? (
        <p className="learning-form__error" role="alert">
          {error}
        </p>
      ) : null}
      <div className="learning-form__actions">
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {LEARNING_CREATE_SUBMIT_LABEL}
        </button>
      </div>
    </form>
  );
}
