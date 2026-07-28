import { REPLY_TEMPLATES } from '@ojt-app/shared';
import {
  MESSAGE_SEND_BUTTON_LABEL,
  type MessageFreeTextFieldConfig,
} from '../domain/messageSendForm';
import {
  canSendTrainerMessage,
  canSendTrainerTemplate,
} from '../domain/messageTrainerForm';
import { MessageFreeTextField } from './MessageFreeTextField';

interface TrainerTemplateMessageFormProps {
  regionLabel: string;
  comboboxLabel: string;
  fieldId: string;
  regionClassName: string;
  selectedTemplateId: string;
  onSelectTemplate: (templateId: string) => void;
  onSend: () => void;
  freeText?: MessageFreeTextFieldConfig;
}

export function TrainerTemplateMessageForm({
  regionLabel,
  comboboxLabel,
  fieldId,
  regionClassName,
  selectedTemplateId,
  onSelectTemplate,
  onSend,
  freeText,
}: TrainerTemplateMessageFormProps) {
  const canSend = freeText
    ? canSendTrainerMessage(selectedTemplateId, freeText.content)
    : canSendTrainerTemplate(selectedTemplateId);

  return (
    <section className={regionClassName} role="region" aria-label={regionLabel}>
      <label htmlFor={fieldId}>{comboboxLabel}</label>
      <select
        id={fieldId}
        className="form-select"
        aria-label={comboboxLabel}
        value={selectedTemplateId}
        onChange={(event) => onSelectTemplate(event.target.value)}
      >
        <option value="">選択してください</option>
        {REPLY_TEMPLATES.map((template) => (
          <option key={template.id} value={template.id}>
            {template.label}
          </option>
        ))}
      </select>
      {freeText ? (
        <MessageFreeTextField
          fieldId={freeText.fieldId}
          value={freeText.content}
          onChange={freeText.onChange}
        />
      ) : null}
      <button
        type="button"
        className="btn btn-primary"
        onClick={onSend}
        disabled={!canSend}
      >
        {MESSAGE_SEND_BUTTON_LABEL}
      </button>
    </section>
  );
}
