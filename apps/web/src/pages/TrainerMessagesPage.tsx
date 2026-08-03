import { useEffect, useState } from 'react';
import { fetchTrainerStatus } from '../api/statusApi';
import { useAuth } from '../auth/AuthContext';
import { MessageSplitView } from '../components/MessageSplitView';
import { MessageThreadDetailPane } from '../components/MessageThreadDetailPane';
import { MessageThreadList } from '../components/MessageThreadList';
import { TrainerNewMessageForm } from '../components/TrainerNewMessageForm';
import { TrainerStatusPanel } from '../components/TrainerStatusPanel';
import { TrainerThreadReplyPanel } from '../components/TrainerThreadReplyPanel';
import {
  TRAINER_STATUS,
  type TrainerStatusType,
} from '../domain/statusConstants';
import { useTrainerMessages } from '../hooks/useTrainerMessages';

export function TrainerMessagesPage() {
  const { user } = useAuth();
  const [trainerStatus, setTrainerStatus] = useState<TrainerStatusType>(
    TRAINER_STATUS.FOCUS_MODE,
  );

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
    sendError,
  } = useTrainerMessages(user);

  useEffect(() => {
    if (!user) {
      return;
    }

    void fetchTrainerStatus(user.userId, user)
      .then((record) => {
        setTrainerStatus(record.status);
      })
      .catch(() => {
        setTrainerStatus(TRAINER_STATUS.FOCUS_MODE);
      });
  }, [user]);

  if (!user) {
    return null;
  }

  const {
    selectedReplyTemplateId,
    replyFreeTextContent,
    onSelectTemplate,
    onFreeTextChange,
    onSendTemplateReply,
    onSendStampReply,
  } = threadReplyForm;

  const selectedThreadId = inlineDetail.selectedThreadId;

  return (
    <section
      className="page-section page-section--wide page-section--messaging"
      aria-labelledby="messages-heading"
    >
      <div className="page-section__title-row">
        <h1 id="messages-heading">メッセージ</h1>
        <TrainerStatusPanel status={trainerStatus} />
      </div>

      {sendError ? <div role="alert">{sendError}</div> : null}

      <MessageSplitView
        sendForm={
          <TrainerNewMessageForm
            selectedTemplateId={selectedNewMessageTemplateId}
            freeTextContent={newMessageFreeTextContent}
            onSelectTemplate={setSelectedNewMessageTemplateId}
            onFreeTextChange={setNewMessageFreeTextContent}
            onSend={() => void sendNewMessage(user)}
          />
        }
        threadList={
          <MessageThreadList
            threads={visibleThreads}
            page={threadListPage}
            totalPages={threadListTotalPages}
            onNextPage={goToNextThreadListPage}
            inlineDetail={inlineDetail}
            onSelectThread={selectThread}
          />
        }
        detail={
          selectedThreadId ? (
            <MessageThreadDetailPane
              threadId={selectedThreadId}
              viewer={user}
              messages={threadMessages}
              historyError={historyError}
            >
              <TrainerThreadReplyPanel
                selectedReplyTemplateId={selectedReplyTemplateId}
                replyFreeTextContent={replyFreeTextContent}
                onSelectTemplate={onSelectTemplate}
                onFreeTextChange={onFreeTextChange}
                onSendTemplateReply={onSendTemplateReply}
                onSendStampReply={onSendStampReply}
              />
            </MessageThreadDetailPane>
          ) : null
        }
      />
    </section>
  );
}
