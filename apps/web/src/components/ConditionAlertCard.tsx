import { Link } from 'react-router-dom';
import type { ConditionAlert } from '../api/conditionApi';

interface ConditionAlertCardProps {
  alert: ConditionAlert;
}

export function ConditionAlertCard({ alert }: ConditionAlertCardProps) {
  return (
    <article aria-label={`新卒 ${alert.traineeId}`}>
      <p>新卒 {alert.traineeId}</p>
      {alert.hasAlert ? <p>{alert.message}</p> : null}
      <Link to={`/trainees/${alert.traineeId}`}>
        新卒 {alert.traineeId} の詳細
      </Link>
    </article>
  );
}
