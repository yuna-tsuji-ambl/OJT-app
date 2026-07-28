import { useAuth } from '../auth/AuthContext';
import { MessageThreadList } from '../components/MessageThreadList';
import { TrainerNewMessageForm } from '../components/TrainerNewMessageForm';
import { TrainerThreadReplyPanel } from '../components/TrainerThreadReplyPanel';
import { useTrainerMessages } from '../hooks/useTrainerMessages';

export function TrainerMessagesPage() {
  const { user } = useAuth();

  const {
    visibleThreads,
    threadListPage,
    threadListTotalPages,
    goToNextThreadListPage,
    threadMessages,
    historyError,
    inlineDetail,
    selectedNewMessageTemplateId,
    setSelectedNewMessageTemplateId,
    newMessageFreeTextContent,
    setNewMessageFreeTextContent,
    threadReplyForm,
    selectThread,
    sendNewMessage,
  } = useTrainerMessages(user);

  if (!user) {
    return null;
  }

  const {
    selectedReplyTemplateId,
    onSelectTemplate,
    onSendTemplateReply,
    onSendStampReply,
  } = threadReplyForm;

  return (
    <section className="page-section" aria-labelledby="messages-heading">
      <h1 id="messages-heading">メッセージ</h1>

      <TrainerNewMessageForm
        selectedTemplateId={selectedNewMessageTemplateId}
        freeTextContent={newMessageFreeTextContent}
        onSelectTemplate={setSelectedNewMessageTemplateId}
        onFreeTextChange={setNewMessageFreeTextContent}
        onSend={() => void sendNewMessage(user)}
      />

      <MessageThreadList
        threads={visibleThreads}
        page={threadListPage}
        totalPages={threadListTotalPages}
        onNextPage={goToNextThreadListPage}
        inlineDetail={inlineDetail}
        viewer={user}
        threadMessages={threadMessages}
        historyError={historyError}
        onSelectThread={selectThread}
        inlineDetailActions={
          <TrainerThreadReplyPanel
            selectedReplyTemplateId={selectedReplyTemplateId}
            onSelectTemplate={onSelectTemplate}
            onSendTemplateReply={onSendTemplateReply}
            onSendStampReply={onSendStampReply}
          />
        }
      />
    </section>
  );
}
