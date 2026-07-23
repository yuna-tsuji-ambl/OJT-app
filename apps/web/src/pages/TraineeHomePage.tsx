import { useEffect, useState } from 'react';
import { fetchTrainerStatus } from '../api/statusApi';
import { useAuth } from '../auth/AuthContext';
import { ChatHistory } from '../components/ChatHistory';
import { MessageThreadList } from '../components/MessageThreadList';
import { QuestionForm } from '../components/QuestionForm';
import { TraineeThreadHistorySection } from '../components/TraineeThreadHistorySection';
import { TrainerStatusPanel } from '../components/TrainerStatusPanel';
import { DEFAULT_TRAINER_ID } from '../domain/statusConstants';
import type { TrainerStatusType } from '../domain/statusConstants';
import { useTraineeHomeMessaging } from '../hooks/useTraineeHomeMessaging';

export function TraineeHomePage() {
  const { user } = useAuth();
  const [trainerStatus, setTrainerStatus] = useState<TrainerStatusType | ''>(
    '',
  );

  const {
    messages,
    threadMessages,
    threads,
    selectedThreadId,
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
      <MessageThreadList threads={threads} onSelectThread={selectThread} />
      <TraineeThreadHistorySection
        selectedThreadId={selectedThreadId}
        messages={threadMessages}
        threadReplyForm={threadReplyForm}
      />
      <ChatHistory messages={messages} />
    </section>
  );
}
