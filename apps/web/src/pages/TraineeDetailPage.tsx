import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  fetchLatestConditionRecord,
  type ConditionHistoryRecord,
} from '../api/conditionApi';
import { useAuth } from '../auth/AuthContext';
import { CurrentConditionPanel } from '../components/CurrentConditionPanel';

export function TraineeDetailPage() {
  const { traineeId } = useParams();
  const { user } = useAuth();
  const [record, setRecord] = useState<ConditionHistoryRecord | null>(null);

  useEffect(() => {
    if (!user || !traineeId) {
      return;
    }

    void fetchLatestConditionRecord(traineeId, user).then(setRecord);
  }, [traineeId, user]);

  if (!traineeId) {
    return null;
  }

  return (
    <section className="page-section" aria-labelledby="trainee-detail-heading">
      <h1 id="trainee-detail-heading">新卒 {traineeId} の詳細</h1>
      {record ? <CurrentConditionPanel record={record} /> : null}
    </section>
  );
}
