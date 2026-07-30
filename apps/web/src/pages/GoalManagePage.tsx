import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { GoalManageList } from '../components/GoalManageList';
import {
  GOAL_GANTT_LINK_LABEL,
  GOAL_GANTT_PATH,
  GOAL_MANAGE_HEADING_ID,
  GOAL_MANAGE_PAGE_TITLE,
} from '../domain/goalForm';
import { useGoalManage } from '../hooks/useGoalManage';

export function GoalManagePage() {
  const { user } = useAuth();
  const {
    goals,
    feedback,
    createGoalAndReload,
    updateGoalAndReload,
    deleteGoalAndReload,
  } = useGoalManage(user);

  if (!user) {
    return null;
  }

  const authUser = user;

  return (
    <section className="page-section" aria-labelledby={GOAL_MANAGE_HEADING_ID}>
      <div className="page-section__header">
        <h1 id={GOAL_MANAGE_HEADING_ID}>{GOAL_MANAGE_PAGE_TITLE}</h1>
        <Link to={GOAL_GANTT_PATH} className="btn">
          {GOAL_GANTT_LINK_LABEL}
        </Link>
      </div>
      {feedback ? (
        <p
          className={
            feedback.type === 'success'
              ? 'goal-feedback goal-feedback--success'
              : 'goal-feedback goal-feedback--error'
          }
          role={feedback.type === 'success' ? 'status' : 'alert'}
          aria-label={feedback.message}
        >
          {feedback.message}
        </p>
      ) : null}
      <GoalManageList
        goals={goals}
        user={authUser}
        onCreate={createGoalAndReload}
        onUpdate={updateGoalAndReload}
        onDelete={authUser.role === 'trainer' ? deleteGoalAndReload : undefined}
      />
    </section>
  );
}
