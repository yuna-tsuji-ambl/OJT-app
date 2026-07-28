import {
  MESSAGE_NEW_REGION_LABEL,
  MESSAGE_TEMPLATE_COMBOBOX_LABEL,
  NEW_MESSAGE_FREE_TEXT_FIELD_ID,
  NEW_MESSAGE_TEMPLATE_FIELD_ID,
} from '../domain/messageTrainerForm';
import { TrainerTemplateMessageForm } from './TrainerTemplateMessageForm';

interface TrainerNewMessageFormProps {
  selectedTemplateId: string;
  freeTextContent: string;
  onSelectTemplate: (templateId: string) => void;
  onFreeTextChange: (content: string) => void;
  onSend: () => void;
}

export function TrainerNewMessageForm({
  selectedTemplateId,
  freeTextContent,
  onSelectTemplate,
  onFreeTextChange,
  onSend,
}: TrainerNewMessageFormProps) {
  return (
    <TrainerTemplateMessageForm
      regionLabel={MESSAGE_NEW_REGION_LABEL}
      comboboxLabel={MESSAGE_TEMPLATE_COMBOBOX_LABEL}
      fieldId={NEW_MESSAGE_TEMPLATE_FIELD_ID}
      regionClassName="message-new-region"
      selectedTemplateId={selectedTemplateId}
      onSelectTemplate={onSelectTemplate}
      onSend={onSend}
      freeText={{
        fieldId: NEW_MESSAGE_FREE_TEXT_FIELD_ID,
        content: freeTextContent,
        onChange: onFreeTextChange,
      }}
    />
  );
}
