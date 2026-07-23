import type { ThreadChatMessage } from '@ojt-app/shared';
import {
  THREAD_QUESTION_FREE_TEXT_FIELD_ID,
  THREAD_QUESTION_TEMPLATE_FIELD_ID,
} from '../domain/messageSendForm';
import type { TraineeThreadReplyFormState } from '../domain/traineeThreadReplyForm';
import { MessageThreadDetail } from './MessageThreadDetail';
import { MessageThreadHistory } from './MessageThreadHistory';
import { QuestionForm } from './QuestionForm';
import { TraineeStampReplyBar } from './TraineeStampReplyBar';

interface TraineeThreadHistorySectionProps {
  selectedThreadId: string | null;
  messages: ThreadChatMessage[];
  threadReplyForm: TraineeThreadReplyFormState;
}

export function TraineeThreadHistorySection({
  selectedThreadId,
  messages,
  threadReplyForm,
}: TraineeThreadHistorySectionProps) {
  const history = <MessageThreadHistory messages={messages} />;

  if (!selectedThreadId) {
    return history;
  }

  const {
    selectedTemplateId,
    freeTextContent,
    onSelectTemplate,
    onFreeTextChange,
    onSend,
    onSendStampReply,
  } = threadReplyForm;

  return (
    <MessageThreadDetail>
      {history}
      <QuestionForm
        selectedTemplateId={selectedTemplateId}
        freeTextContent={freeTextContent}
        onSelectTemplate={onSelectTemplate}
        onFreeTextChange={onFreeTextChange}
        onSend={onSend}
        templateFieldId={THREAD_QUESTION_TEMPLATE_FIELD_ID}
        freeTextFieldId={THREAD_QUESTION_FREE_TEXT_FIELD_ID}
      />
      <TraineeStampReplyBar onReply={onSendStampReply} />
    </MessageThreadDetail>
  );
}
