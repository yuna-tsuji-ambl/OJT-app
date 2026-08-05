import { TrainerReplyForm } from './TrainerReplyForm';
import { TrainerStampReplyBar } from './TrainerStampReplyBar';

interface TrainerThreadReplyPanelProps {
  selectedReplyTemplateId: string;
  replyFreeTextContent: string;
  onSelectTemplate: (templateId: string) => void;
  onFreeTextChange: (content: string) => void;
  onSendTemplateReply: () => void;
  onSendStampReply: (stampId: string) => void;
}

export function TrainerThreadReplyPanel({
  selectedReplyTemplateId,
  replyFreeTextContent,
  onSelectTemplate,
  onFreeTextChange,
  onSendTemplateReply,
  onSendStampReply,
}: TrainerThreadReplyPanelProps) {
  return (
    <>
      <TrainerReplyForm
        selectedTemplateId={selectedReplyTemplateId}
        freeTextContent={replyFreeTextContent}
        onSelectTemplate={onSelectTemplate}
        onFreeTextChange={onFreeTextChange}
        onSend={onSendTemplateReply}
      />
      <TrainerStampReplyBar onReply={onSendStampReply} />
    </>
  );
}
