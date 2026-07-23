import {
  MESSAGE_REPLY_REGION_LABEL,
  REPLY_TEMPLATE_COMBOBOX_LABEL,
  REPLY_TEMPLATE_FIELD_ID,
} from '../domain/messageTrainerForm';
import { TrainerTemplateMessageForm } from './TrainerTemplateMessageForm';

interface TrainerReplyFormProps {
  selectedTemplateId: string;
  onSelectTemplate: (templateId: string) => void;
  onSend: () => void;
}

export function TrainerReplyForm({
  selectedTemplateId,
  onSelectTemplate,
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
    />
  );
}
