import { useEffect, useState } from 'react';
import { fetchTrainerStatus, sendQuickQuestion } from '../api/statusApi';
import { useAuth } from '../auth/AuthContext';
import { ChatHistory } from '../components/ChatHistory';
import { QuestionForm } from '../components/QuestionForm';
import { TrainerStatusPanel } from '../components/TrainerStatusPanel';
import { DEFAULT_TRAINER_ID } from '../domain/statusConstants';
import type { TrainerStatusType } from '../domain/statusConstants';
import { useConversationMessages } from '../hooks/useConversationMessages';

export function TraineeHomePage() {
  const { user } = useAuth();
  const [trainerStatus, setTrainerStatus] = useState<TrainerStatusType | ''>(
    '',
  );
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const { messages, reloadMessages } = useConversationMessages(user);

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

  const authUser = user;

  async function handleSend(): Promise<void> {
    if (!selectedTemplate) {
      return;
    }

    await sendQuickQuestion(DEFAULT_TRAINER_ID, selectedTemplate, authUser);
    await reloadMessages(authUser);
  }

  return (
    <section className="page-section" aria-labelledby="home-heading">
      <h1 id="home-heading">ホーム</h1>
      {trainerStatus ? <TrainerStatusPanel status={trainerStatus} /> : null}
      <QuestionForm
        onSelectTemplate={setSelectedTemplate}
        onSend={() => void handleSend()}
      />
      <ChatHistory messages={messages} />
    </section>
  );
}
