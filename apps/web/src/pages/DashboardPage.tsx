import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  fetchConditionAlerts,
  type ConditionAlert,
} from '../api/conditionApi';
import { useAuth } from '../auth/AuthContext';

export function DashboardPage() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<ConditionAlert[]>([]);

  useEffect(() => {
    if (!user) {
      return;
    }

    void fetchConditionAlerts(user).then(setAlerts);
  }, [user]);

  return (
    <section aria-labelledby="dashboard-heading">
      <h1 id="dashboard-heading">ダッシュボード</h1>
      {alerts.map((alert) => (
        <article key={alert.traineeId} aria-label={`新卒 ${alert.traineeId}`}>
          <p>新卒 {alert.traineeId}</p>
          {alert.hasAlert ? <p>{alert.message}</p> : null}
          <Link to={`/trainees/${alert.traineeId}`}>
            新卒 {alert.traineeId} の詳細
          </Link>
        </article>
      ))}
    </section>
  );
}
