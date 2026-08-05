import { useAuth } from '../auth/AuthContext';
import { ConditionGraphPanel } from '../components/ConditionGraphPanel';
import { ConditionPageAlertBanner } from '../components/ConditionPageAlertBanner';
import { CurrentConditionPanel } from '../components/CurrentConditionPanel';
import { useTrainerConditionPageData } from '../hooks/useTrainerConditionPageData';

export function TrainerConditionPage() {
  const { user } = useAuth();
  const { record, graphData, pageAlert } = useTrainerConditionPageData(user);

  if (!user) {
    return null;
  }

  return (
    <section
      className="page-section"
      aria-labelledby="trainer-condition-heading"
    >
      <h1 id="trainer-condition-heading">コンディション</h1>
      {pageAlert ? <ConditionPageAlertBanner alert={pageAlert} /> : null}
      {record ? <CurrentConditionPanel record={record} /> : null}
      {graphData ? <ConditionGraphPanel graphData={graphData} /> : null}
    </section>
  );
}
