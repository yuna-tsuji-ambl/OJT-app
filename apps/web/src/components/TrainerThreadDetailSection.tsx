import type { ThreadChatMessage } from '@ojt-app/shared';
import type { AuthUser } from '../auth/types';
import type { TrainerThreadReplyFormState } from '../domain/trainerThreadReplyForm';
import { MessageThreadDetail } from './MessageThreadDetail';
import { MessageThreadHistory } from './MessageThreadHistory';
import { TrainerThreadReplyPanel } from './TrainerThreadReplyPanel';

interface TrainerThreadDetailSectionProps {
  viewer: AuthUser;
  selectedThreadId: string | null;
  messages: ThreadChatMessage[];
  threadReplyForm: TrainerThreadReplyFormState;
}

export function TrainerThreadDetailSection({
  viewer,
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
      <MessageThreadHistory messages={messages} viewer={viewer} />
      <TrainerThreadReplyPanel
        selectedReplyTemplateId={selectedReplyTemplateId}
        onSelectTemplate={onSelectTemplate}
        onSendTemplateReply={onSendTemplateReply}
        onSendStampReply={onSendStampReply}
      />
    </MessageThreadDetail>
  );
}
