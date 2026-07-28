export type TrainerThreadReplyFormState = {
  selectedReplyTemplateId: string;
  onSelectTemplate: (templateId: string) => void;
  onSendTemplateReply: () => void;
  onSendStampReply: (stampId: string) => void;
};
