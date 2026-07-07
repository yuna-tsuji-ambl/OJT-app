import { useEffect, useState } from 'react';
import {
  fetchConditionGraphData,
  fetchLatestConditionRecord,
  type ConditionGraphData,
  type ConditionHistoryRecord,
} from '../api/conditionApi';
import { useAuth } from '../auth/AuthContext';
import { ConditionGraphPanel } from '../components/ConditionGraphPanel';
import { CurrentConditionPanel } from '../components/CurrentConditionPanel';
import { DEFAULT_TRAINEE_ID } from '../domain/statusConstants';

export function TrainerConditionPage() {
  const { user } = useAuth();
  const [record, setRecord] = useState<ConditionHistoryRecord | null>(null);
  const [graphData, setGraphData] = useState<ConditionGraphData | null>(null);

  useEffect(() => {
    if (!user) {
      return;
    }

    void Promise.all([
      fetchLatestConditionRecord(DEFAULT_TRAINEE_ID, user).then(setRecord),
      fetchConditionGraphData(DEFAULT_TRAINEE_ID, user).then(setGraphData),
    ]);
  }, [user]);

  if (!user) {
    return null;
  }

  return (
    <section
      className="page-section"
      aria-labelledby="trainer-condition-heading"
    >
      <h1 id="trainer-condition-heading">コンディション</h1>
      {record ? <CurrentConditionPanel record={record} /> : null}
      {graphData ? <ConditionGraphPanel graphData={graphData} /> : null}
    </section>
  );
}
