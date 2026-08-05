import {
  canSendMessageWithTemplateOnly,
  canSendMessageWithTemplateOrText,
} from './messageSendForm';

export const MESSAGE_THREAD_DETAIL_REGION_LABEL = 'スレッド詳細' as const;
export const MESSAGE_NEW_REGION_LABEL = '新規メッセージ送信' as const;
export const MESSAGE_TEMPLATE_COMBOBOX_LABEL =
  'メッセージテンプレート' as const;
export const MESSAGE_REPLY_REGION_LABEL = 'メッセージ返信' as const;
export const REPLY_TEMPLATE_COMBOBOX_LABEL = '返信テンプレート' as const;
export const NEW_MESSAGE_TEMPLATE_FIELD_ID = 'new-message-template' as const;
export const NEW_MESSAGE_FREE_TEXT_FIELD_ID = 'new-message-free-text' as const;
export const REPLY_TEMPLATE_FIELD_ID = 'reply-template' as const;
export const REPLY_FREE_TEXT_FIELD_ID = 'reply-free-text' as const;

export const canSendTrainerTemplate = canSendMessageWithTemplateOnly;
export const canSendTrainerMessage = canSendMessageWithTemplateOrText;
