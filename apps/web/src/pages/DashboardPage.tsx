import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ConditionAlertCard } from '../components/ConditionAlertCard';
import { PendingQuestCard } from '../components/PendingQuestCard';
import { TrainerQuestProgressCard } from '../components/TrainerQuestProgressCard';
import { useTrainerDashboard } from '../hooks/useTrainerDashboard';

export function DashboardPage() {
  const { user } = useAuth();
  const { alerts, pendingQuests, progressQuests, approveQuestAndReload } =
    useTrainerDashboard(user);

  if (!user) {
    return null;
  }

  const authUser = user;
  const progressQuestIds = new Set(progressQuests.map((quest) => quest.id));

  return (
    <section className="page-section" aria-labelledby="dashboard-heading">
      <h1 id="dashboard-heading">ダッシュボード</h1>
      <p>
        <Link to="/assignments/manage">課題管理画面を開く</Link>
      </p>
      {progressQuests.map((quest) => (
        <TrainerQuestProgressCard
          key={quest.id}
          quest={quest}
          onApprove={(questId) => approveQuestAndReload(questId, authUser)}
        />
      ))}
      {pendingQuests
        .filter((quest) => !progressQuestIds.has(quest.id))
        .map((quest) => (
          <PendingQuestCard
            key={quest.id}
            quest={quest}
            onApprove={(questId) => approveQuestAndReload(questId, authUser)}
          />
        ))}
      {alerts.map((alert) => (
        <ConditionAlertCard key={alert.traineeId} alert={alert} />
      ))}
    </section>
  );
}
