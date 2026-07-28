import { useEffect, useState } from 'react';
import { fetchTrainerStatus } from '../api/statusApi';
import { useAuth } from '../auth/AuthContext';
import { ChatHistory } from '../components/ChatHistory';
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
    messages,
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

  return (
    <section className="page-section" aria-labelledby="home-heading">
      <h1 id="home-heading">ホーム</h1>
      {trainerStatus ? <TrainerStatusPanel status={trainerStatus} /> : null}
      <QuestionForm
        selectedTemplateId={selectedTemplateId}
        freeTextContent={freeTextContent}
        onSelectTemplate={setSelectedTemplateId}
        onFreeTextChange={setFreeTextContent}
        onSend={() => void sendMessage(user)}
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
          <>
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
          </>
        }
      />
      <ChatHistory messages={messages} />
    </section>
  );
}
