import { useAuth } from '../auth/AuthContext';
import { QuestCard } from '../components/QuestCard';
import { useQuestList } from '../hooks/useQuestList';

export function QuestListPage() {
  const { user } = useAuth();
  const { quests, requestClearAndReload } = useQuestList(user);

  if (!user) {
    return null;
  }

  const authUser = user;

  return (
    <section className="page-section" aria-labelledby="quest-list-heading">
      <h1 id="quest-list-heading">クエスト一覧</h1>
      {quests.map((quest) => (
        <QuestCard
          key={quest.id}
          quest={quest}
          onRequest={(questId) => requestClearAndReload(questId, authUser)}
        />
      ))}
    </section>
  );
}
