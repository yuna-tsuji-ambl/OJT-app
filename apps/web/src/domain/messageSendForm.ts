export const MESSAGE_SEND_REGION_LABEL = 'メッセージ送信' as const;
export const QUESTION_TEMPLATE_COMBOBOX_LABEL = '質問テンプレート' as const;
export const FREE_TEXT_INPUT_LABEL = '自由記述' as const;
export const MESSAGE_SEND_BUTTON_LABEL = '送信' as const;
export const QUESTION_TEMPLATE_FIELD_ID = 'question-template' as const;
export const QUESTION_FREE_TEXT_FIELD_ID = 'question-free-text' as const;
export const THREAD_QUESTION_TEMPLATE_FIELD_ID =
  'thread-question-template' as const;
export const THREAD_QUESTION_FREE_TEXT_FIELD_ID =
  'thread-question-free-text' as const;

export type MessageFreeTextFieldConfig = {
  fieldId: string;
  content: string;
  onChange: (content: string) => void;
};

export function canSendMessageWithTemplateOrText(
  selectedTemplateId: string,
  freeTextContent: string,
): boolean {
  return selectedTemplateId.length > 0 || freeTextContent.trim().length > 0;
}

export function canSendMessageWithTemplateOnly(
  selectedTemplateId: string,
): boolean {
  return selectedTemplateId.length > 0;
}

export function canSendTraineeMessage(
  selectedTemplateId: string,
  freeTextContent: string,
): boolean {
  return canSendMessageWithTemplateOrText(selectedTemplateId, freeTextContent);
}
