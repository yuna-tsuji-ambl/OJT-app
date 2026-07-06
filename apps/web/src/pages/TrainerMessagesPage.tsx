import { sendQuickReply } from '../api/statusApi';
import { useAuth } from '../auth/AuthContext';
import { ChatHistory } from '../components/ChatHistory';
import { ReplyStampBar } from '../components/ReplyStampBar';
import { DEFAULT_TRAINEE_ID } from '../domain/statusConstants';
import { useConversationMessages } from '../hooks/useConversationMessages';

export function TrainerMessagesPage() {
  const { user } = useAuth();
  const { messages, reloadMessages } = useConversationMessages(user);

  if (!user) {
    return null;
  }

  const authUser = user;

  function handleReply(stamp: string): void {
    void sendQuickReply(DEFAULT_TRAINEE_ID, stamp, authUser).then(() =>
      reloadMessages(authUser),
    );
  }

  return (
    <section className="page-section" aria-labelledby="messages-heading">
      <h1 id="messages-heading">メッセージ</h1>
      <ChatHistory messages={messages} />
      <ReplyStampBar onReply={handleReply} />
    </section>
  );
}
