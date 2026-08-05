import { FREE_TEXT_INPUT_LABEL } from '../domain/messageSendForm';

interface MessageFreeTextFieldProps {
  fieldId: string;
  value: string;
  onChange: (value: string) => void;
}

export function MessageFreeTextField({
  fieldId,
  value,
  onChange,
}: MessageFreeTextFieldProps) {
  return (
    <div className="message-form-field">
      <label htmlFor={fieldId}>{FREE_TEXT_INPUT_LABEL}</label>
      <textarea
        id={fieldId}
        className="form-textarea"
        aria-label={FREE_TEXT_INPUT_LABEL}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={3}
      />
    </div>
  );
}
