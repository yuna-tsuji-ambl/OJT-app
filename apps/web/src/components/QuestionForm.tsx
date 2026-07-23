import { QUESTION_TEMPLATES } from '@ojt-app/shared';
import {
  canSendTraineeMessage,
  MESSAGE_SEND_BUTTON_LABEL,
  MESSAGE_SEND_REGION_LABEL,
  QUESTION_FREE_TEXT_FIELD_ID,
  QUESTION_TEMPLATE_COMBOBOX_LABEL,
  QUESTION_TEMPLATE_FIELD_ID,
} from '../domain/messageSendForm';
import { MessageFreeTextField } from './MessageFreeTextField';

interface QuestionFormProps {
  selectedTemplateId: string;
  freeTextContent: string;
  onSelectTemplate: (templateId: string) => void;
  onFreeTextChange: (content: string) => void;
  onSend: () => void;
  templateFieldId?: string;
  freeTextFieldId?: string;
}

export function QuestionForm({
  selectedTemplateId,
  freeTextContent,
  onSelectTemplate,
  onFreeTextChange,
  onSend,
  templateFieldId = QUESTION_TEMPLATE_FIELD_ID,
  freeTextFieldId = QUESTION_FREE_TEXT_FIELD_ID,
}: QuestionFormProps) {
  const canSend = canSendTraineeMessage(selectedTemplateId, freeTextContent);

  return (
    <section
      className="message-send-region"
      role="region"
      aria-label={MESSAGE_SEND_REGION_LABEL}
    >
      <label htmlFor={templateFieldId}>質問テンプレート</label>
      <select
        id={templateFieldId}
        className="form-select"
        aria-label={QUESTION_TEMPLATE_COMBOBOX_LABEL}
        value={selectedTemplateId}
        onChange={(event) => onSelectTemplate(event.target.value)}
      >
        <option value="">選択してください</option>
        {QUESTION_TEMPLATES.map((template) => (
          <option key={template.id} value={template.id}>
            {template.label}
          </option>
        ))}
      </select>
      <MessageFreeTextField
        fieldId={freeTextFieldId}
        value={freeTextContent}
        onChange={onFreeTextChange}
      />
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
