import {
  MESSAGE_REPLY_REGION_LABEL,
  REPLY_FREE_TEXT_FIELD_ID,
  REPLY_TEMPLATE_COMBOBOX_LABEL,
  REPLY_TEMPLATE_FIELD_ID,
} from '../domain/messageTrainerForm';
import { TrainerTemplateMessageForm } from './TrainerTemplateMessageForm';

interface TrainerReplyFormProps {
  selectedTemplateId: string;
  freeTextContent: string;
  onSelectTemplate: (templateId: string) => void;
  onFreeTextChange: (content: string) => void;
  onSend: () => void;
}

export function TrainerReplyForm({
  selectedTemplateId,
  freeTextContent,
  onSelectTemplate,
  onFreeTextChange,
  onSend,
}: TrainerReplyFormProps) {
  return (
    <TrainerTemplateMessageForm
      regionLabel={MESSAGE_REPLY_REGION_LABEL}
      comboboxLabel={REPLY_TEMPLATE_COMBOBOX_LABEL}
      fieldId={REPLY_TEMPLATE_FIELD_ID}
      regionClassName="message-reply-region"
      selectedTemplateId={selectedTemplateId}
      onSelectTemplate={onSelectTemplate}
      onSend={onSend}
      freeText={{
        fieldId: REPLY_FREE_TEXT_FIELD_ID,
        content: freeTextContent,
        onChange: onFreeTextChange,
      }}
    />
  );
}
