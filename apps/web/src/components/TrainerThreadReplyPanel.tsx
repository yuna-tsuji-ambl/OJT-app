import { TrainerReplyForm } from './TrainerReplyForm';
import { TrainerStampReplyBar } from './TrainerStampReplyBar';

interface TrainerThreadReplyPanelProps {
  selectedReplyTemplateId: string;
  onSelectTemplate: (templateId: string) => void;
  onSendTemplateReply: () => void;
  onSendStampReply: (stampId: string) => void;
}

export function TrainerThreadReplyPanel({
  selectedReplyTemplateId,
  onSelectTemplate,
  onSendTemplateReply,
  onSendStampReply,
}: TrainerThreadReplyPanelProps) {
  return (
    <>
      <TrainerReplyForm
        selectedTemplateId={selectedReplyTemplateId}
        onSelectTemplate={onSelectTemplate}
        onSend={onSendTemplateReply}
      />
      <TrainerStampReplyBar onReply={onSendStampReply} />
    </>
  );
}
