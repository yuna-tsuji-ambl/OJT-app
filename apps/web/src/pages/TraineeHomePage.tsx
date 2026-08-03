import { useEffect, useState } from 'react';
import { fetchTrainerStatus } from '../api/statusApi';
import { useAuth } from '../auth/AuthContext';
import { MessageSplitView } from '../components/MessageSplitView';
import { MessageThreadDetailPane } from '../components/MessageThreadDetailPane';
import { MessageThreadList } from '../components/MessageThreadList';
import { QuestionForm } from '../components/QuestionForm';
import { TrainerStatusPanel } from '../components/TrainerStatusPanel';
import {
  THREAD_QUESTION_FREE_TEXT_FIELD_ID,
  THREAD_QUESTION_TEMPLATE_FIELD_ID,
} from '../domain/messageSendForm';
import { DEFAULT_TRAINER_ID } from '../domain/statusConstants';
import type { TrainerStatusType } from '../domain/statusConstants';
import { TraineeStampReplyBar } from '../components/TraineeStampReplyBar';
import { useTraineeHomeMessaging } from '../hooks/useTraineeHomeMessaging';

export function TraineeHomePage() {
  const { user } = useAuth();
  const [trainerStatus, setTrainerStatus] = useState<TrainerStatusType | ''>(
    '',
  );

  const {
    threadMessages,
    visibleThreads,
    threadListPage,
    threadListTotalPages,
    goToNextThreadListPage,
    inlineDetail,
    historyError,
    selectedTemplateId,
    freeTextContent,
    threadReplyForm,
    setSelectedTemplateId,
    setFreeTextContent,
    selectThread,
    sendMessage,
  } = useTraineeHomeMessaging(user);

  useEffect(() => {
    if (!user) {
      return;
    }

    void fetchTrainerStatus(DEFAULT_TRAINER_ID, user).then((record) => {
      setTrainerStatus(record.status);
    });
  }, [user]);

  if (!user) {
    return null;
  }

  const {
    selectedTemplateId: threadSelectedTemplateId,
    freeTextContent: threadFreeTextContent,
    onSelectTemplate,
    onFreeTextChange,
    onSend,
    onSendStampReply,
  } = threadReplyForm;

  const selectedThreadId = inlineDetail.selectedThreadId;

  return (
    <section
      className="page-section page-section--wide page-section--messaging"
      aria-labelledby="home-heading"
    >
      <div className="page-section__title-row">
        <h1 id="home-heading">ホーム</h1>
        {trainerStatus ? <TrainerStatusPanel status={trainerStatus} /> : null}
      </div>
      <MessageSplitView
        sendForm={
          <QuestionForm
            selectedTemplateId={selectedTemplateId}
            freeTextContent={freeTextContent}
            onSelectTemplate={setSelectedTemplateId}
            onFreeTextChange={setFreeTextContent}
            onSend={() => void sendMessage(user)}
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
              <QuestionForm
                selectedTemplateId={threadSelectedTemplateId}
                freeTextContent={threadFreeTextContent}
                onSelectTemplate={onSelectTemplate}
                onFreeTextChange={onFreeTextChange}
                onSend={onSend}
                templateFieldId={THREAD_QUESTION_TEMPLATE_FIELD_ID}
                freeTextFieldId={THREAD_QUESTION_FREE_TEXT_FIELD_ID}
              />
              <TraineeStampReplyBar onReply={onSendStampReply} />
            </MessageThreadDetailPane>
          ) : null
        }
      />
    </section>
  );
}
