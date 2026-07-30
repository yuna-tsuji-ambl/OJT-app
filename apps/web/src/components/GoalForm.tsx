import { useEffect, useState, type FormEvent } from 'react';
import type { GoalFormValues } from '../domain/goalForm';
import {
  GOAL_CREATE_SUBMIT_LABEL,
  GOAL_DESCRIPTION_FIELD_LABEL,
  GOAL_END_DATE_FIELD_LABEL,
  GOAL_PROGRESS_FIELD_LABEL,
  GOAL_PROGRESS_MAX,
  GOAL_PROGRESS_MIN,
  GOAL_START_DATE_FIELD_LABEL,
  GOAL_STATUS_FIELD_LABEL,
  GOAL_STATUS_OPTIONS,
  GOAL_TITLE_FIELD_LABEL,
  GOAL_UPDATE_SUBMIT_LABEL,
  createEmptyGoalFormValues,
  validateGoalFormValues,
} from '../domain/goalForm';

interface GoalFormProps {
  readonly regionLabel: string;
  readonly initialValues?: GoalFormValues;
  readonly submitLabel?: string;
  readonly onSubmit: (values: GoalFormValues) => Promise<boolean>;
  readonly onCancel?: () => void;
}

export function GoalForm({
  regionLabel,
  initialValues,
  submitLabel,
  onSubmit,
  onCancel,
}: GoalFormProps) {
  const fieldIdPrefix =
    regionLabel === '目標編集' ? 'goal-edit' : 'goal-create';
  const titleFieldId = `${fieldIdPrefix}-title`;
  const descriptionFieldId = `${fieldIdPrefix}-description`;
  const startDateFieldId = `${fieldIdPrefix}-start-date`;
  const endDateFieldId = `${fieldIdPrefix}-end-date`;
  const progressFieldId = `${fieldIdPrefix}-progress`;
  const statusFieldId = `${fieldIdPrefix}-status`;

  const [values, setValues] = useState<GoalFormValues>(
    initialValues ?? createEmptyGoalFormValues(),
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setValues(initialValues ?? createEmptyGoalFormValues());
    setError(null);
  }, [initialValues]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = validateGoalFormValues(values);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    const succeeded = await onSubmit(values);
    setSubmitting(false);

    if (succeeded) {
      if (!initialValues) {
        setValues(createEmptyGoalFormValues());
      }
      setError(null);
    }
  };

  return (
    <form
      className="goal-form"
      aria-label={regionLabel}
      onSubmit={(event) => {
        void handleSubmit(event);
      }}
    >
      <div className="goal-form__field">
        <label htmlFor={titleFieldId}>{GOAL_TITLE_FIELD_LABEL}</label>
        <input
          id={titleFieldId}
          type="text"
          value={values.title}
          onChange={(event) =>
            setValues((current) => ({ ...current, title: event.target.value }))
          }
        />
      </div>
      <div className="goal-form__field">
        <label htmlFor={descriptionFieldId}>
          {GOAL_DESCRIPTION_FIELD_LABEL}
        </label>
        <input
          id={descriptionFieldId}
          type="text"
          value={values.description}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              description: event.target.value,
            }))
          }
        />
      </div>
      <div className="goal-form__field">
        <label htmlFor={startDateFieldId}>{GOAL_START_DATE_FIELD_LABEL}</label>
        <input
          id={startDateFieldId}
          type="date"
          value={values.startDate}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              startDate: event.target.value,
            }))
          }
        />
      </div>
      <div className="goal-form__field">
        <label htmlFor={endDateFieldId}>{GOAL_END_DATE_FIELD_LABEL}</label>
        <input
          id={endDateFieldId}
          type="date"
          value={values.endDate}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              endDate: event.target.value,
            }))
          }
        />
      </div>
      <div className="goal-form__field">
        <label htmlFor={progressFieldId}>{GOAL_PROGRESS_FIELD_LABEL}</label>
        <input
          id={progressFieldId}
          type="number"
          min={GOAL_PROGRESS_MIN}
          max={GOAL_PROGRESS_MAX}
          value={values.progress}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              progress: Number(event.target.value),
            }))
          }
        />
      </div>
      <div className="goal-form__field">
        <label htmlFor={statusFieldId}>{GOAL_STATUS_FIELD_LABEL}</label>
        <select
          id={statusFieldId}
          value={values.status}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              status: event.target.value as GoalFormValues['status'],
            }))
          }
        >
          {GOAL_STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      {error ? (
        <p className="goal-form__error" role="alert">
          {error}
        </p>
      ) : null}
      <div className="goal-form__actions">
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitLabel ??
            (initialValues
              ? GOAL_UPDATE_SUBMIT_LABEL
              : GOAL_CREATE_SUBMIT_LABEL)}
        </button>
        {onCancel ? (
          <button type="button" className="btn" onClick={onCancel}>
            キャンセル
          </button>
        ) : null}
      </div>
    </form>
  );
}
