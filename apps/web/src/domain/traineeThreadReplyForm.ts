export type TraineeThreadReplyFormState = {
  selectedTemplateId: string;
  freeTextContent: string;
  onSelectTemplate: (templateId: string) => void;
  onFreeTextChange: (content: string) => void;
  onSend: () => void;
  onSendStampReply: (stampId: string) => void;
};
