import { useAuth } from '../auth/AuthContext';

import { MessageThreadList } from '../components/MessageThreadList';

import { TrainerNewMessageForm } from '../components/TrainerNewMessageForm';

import { TrainerThreadDetailSection } from '../components/TrainerThreadDetailSection';

import { useTrainerMessages } from '../hooks/useTrainerMessages';

export function TrainerMessagesPage() {
  const { user } = useAuth();

  const {
    threads,

    threadMessages,

    selectedThreadId,

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

      <MessageThreadList threads={threads} onSelectThread={selectThread} />

      <TrainerThreadDetailSection
        selectedThreadId={selectedThreadId}

        messages={threadMessages}

        threadReplyForm={threadReplyForm}
      />
    </section>
  );
}
