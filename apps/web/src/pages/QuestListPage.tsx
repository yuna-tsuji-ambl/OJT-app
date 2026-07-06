import { useEffect, useState } from 'react';
import { fetchQuestList, requestQuestClear, type Quest } from '../api/questApi';
import { useAuth } from '../auth/AuthContext';
import { QuestCard } from '../components/QuestCard';

export function QuestListPage() {
  const { user } = useAuth();
  const [quests, setQuests] = useState<Quest[]>([]);

  useEffect(() => {
    if (!user) {
      return;
    }

    void fetchQuestList(user).then(setQuests);
  }, [user]);

  if (!user) {
    return null;
  }

  const authUser = user;

  async function handleRequest(questId: string): Promise<void> {
    await requestQuestClear(questId, authUser);
    setQuests(await fetchQuestList(authUser));
  }

  return (
    <section className="page-section" aria-labelledby="quest-list-heading">
      <h1 id="quest-list-heading">クエスト一覧</h1>
      {quests.map((quest) => (
        <QuestCard key={quest.id} quest={quest} onRequest={handleRequest} />
      ))}
    </section>
  );
}
