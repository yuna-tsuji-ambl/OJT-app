export type TrainerThreadReplyFormState = {
  selectedReplyTemplateId: string;
  replyFreeTextContent: string;
  onSelectTemplate: (templateId: string) => void;
  onFreeTextChange: (content: string) => void;
  onSendTemplateReply: () => void;
  onSendStampReply: (stampId: string) => void;
};
