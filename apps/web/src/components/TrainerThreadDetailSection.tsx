import type { ThreadChatMessage } from '@ojt-app/shared';
import type { TrainerThreadReplyFormState } from '../domain/trainerThreadReplyForm';
import { MessageThreadDetail } from './MessageThreadDetail';
import { MessageThreadHistory } from './MessageThreadHistory';
import { TrainerThreadReplyPanel } from './TrainerThreadReplyPanel';

interface TrainerThreadDetailSectionProps {
  selectedThreadId: string | null;
  messages: ThreadChatMessage[];
  threadReplyForm: TrainerThreadReplyFormState;
}

export function TrainerThreadDetailSection({
  selectedThreadId,
  messages,
  threadReplyForm,
}: TrainerThreadDetailSectionProps) {
  if (!selectedThreadId) {
    return null;
  }

  const {
    selectedReplyTemplateId,
    onSelectTemplate,
    onSendTemplateReply,
    onSendStampReply,
  } = threadReplyForm;

  return (
    <MessageThreadDetail>
      <MessageThreadHistory messages={messages} />
      <TrainerThreadReplyPanel
        selectedReplyTemplateId={selectedReplyTemplateId}
        onSelectTemplate={onSelectTemplate}
        onSendTemplateReply={onSendTemplateReply}
        onSendStampReply={onSendStampReply}
      />
    </MessageThreadDetail>
  );
}
