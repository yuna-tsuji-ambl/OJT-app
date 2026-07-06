import { useEffect, useState } from 'react';
import { fetchConditionAlerts, type ConditionAlert } from '../api/conditionApi';
import { approveQuest, fetchPendingQuests, type Quest } from '../api/questApi';
import { useAuth } from '../auth/AuthContext';
import { ConditionAlertCard } from '../components/ConditionAlertCard';
import { PendingQuestCard } from '../components/PendingQuestCard';

export function DashboardPage() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<ConditionAlert[]>([]);
  const [pendingQuests, setPendingQuests] = useState<Quest[]>([]);

  useEffect(() => {
    if (!user) {
      return;
    }

    void fetchConditionAlerts(user).then(setAlerts);
    void fetchPendingQuests(user).then(setPendingQuests);
  }, [user]);

  if (!user) {
    return null;
  }

  const authUser = user;

  async function handleApprove(questId: string): Promise<void> {
    await approveQuest(questId, authUser);
    setPendingQuests(await fetchPendingQuests(authUser));
  }

  return (
    <section className="page-section" aria-labelledby="dashboard-heading">
      <h1 id="dashboard-heading">ダッシュボード</h1>
      {pendingQuests.map((quest) => (
        <PendingQuestCard
          key={quest.id}
          quest={quest}
          onApprove={handleApprove}
        />
      ))}
      {alerts.map((alert) => (
        <ConditionAlertCard key={alert.traineeId} alert={alert} />
      ))}
    </section>
  );
}
