import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { GanttChart } from '../components/GanttChart';
import {
  GOAL_GANTT_HEADING_ID,
  GOAL_GANTT_PAGE_TITLE,
  GOAL_MANAGE_LINK_LABEL,
  GOAL_MANAGE_PATH,
} from '../domain/goalForm';
import { useGoals } from '../hooks/useGoals';

export function GoalGanttPage() {
  const { user } = useAuth();
  const { goals, loading, error, updateGoalDates } = useGoals(user);

  if (!user) {
    return null;
  }

  const authUser = user;

  return (
    <section className="page-section" aria-labelledby={GOAL_GANTT_HEADING_ID}>
      <div className="page-section__header">
        <h1 id={GOAL_GANTT_HEADING_ID}>{GOAL_GANTT_PAGE_TITLE}</h1>
        <Link to={GOAL_MANAGE_PATH} className="btn">
          {GOAL_MANAGE_LINK_LABEL}
        </Link>
      </div>
      {loading ? <p>読み込み中...</p> : null}
      {error ? (
        <p className="goal-form__error" role="alert">
          {error}
        </p>
      ) : null}
      {!loading ? (
        <GanttChart
          goals={goals}
          onUpdateDates={async (goalId, startDate, endDate) => {
            await updateGoalDates(goalId, { startDate, endDate }, authUser);
          }}
        />
      ) : null}
    </section>
  );
}
