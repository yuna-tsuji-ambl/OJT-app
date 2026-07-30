import { useState } from 'react';
import type { AuthUser } from '../auth/types';
import {
  GOAL_DELETE_BUTTON_LABEL,
  GOAL_EDIT_BUTTON_LABEL,
  GOAL_EDIT_REGION_LABEL,
  GOAL_MANAGE_LIST_REGION_LABEL,
  GOAL_STATUS_LABELS,
  goalToFormValues,
  toCreateGoalInput,
  toUpdateGoalInput,
  type GoalResponse,
} from '../domain/goalForm';
import { GoalForm } from './GoalForm';

interface GoalManageListProps {
  readonly goals: readonly GoalResponse[];
  readonly user: AuthUser;
  readonly onCreate: (
    input: ReturnType<typeof toCreateGoalInput>,
    authUser: AuthUser,
  ) => Promise<boolean>;
  readonly onUpdate: (
    goalId: string,
    input: ReturnType<typeof toUpdateGoalInput>,
    authUser: AuthUser,
  ) => Promise<boolean>;
  readonly onDelete?: (goalId: string, authUser: AuthUser) => Promise<boolean>;
}

export function GoalManageList({
  goals,
  user,
  onCreate,
  onUpdate,
  onDelete,
}: GoalManageListProps) {
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const editingGoal = goals.find((goal) => goal.id === editingGoalId) ?? null;
  const canDelete = user.role === 'trainer' && onDelete !== undefined;

  return (
    <section aria-label={GOAL_MANAGE_LIST_REGION_LABEL}>
      <GoalForm
        regionLabel="目標作成"
        onSubmit={async (values) => onCreate(toCreateGoalInput(values), user)}
      />
      <ul className="goal-manage-list">
        {goals.map((goal) => (
          <li key={goal.id} className="goal-manage-list__item">
            {editingGoalId === goal.id && editingGoal ? (
              <GoalForm
                regionLabel={GOAL_EDIT_REGION_LABEL}
                initialValues={goalToFormValues(editingGoal)}
                onSubmit={async (values) => {
                  const succeeded = await onUpdate(
                    goal.id,
                    toUpdateGoalInput(values),
                    user,
                  );
                  if (succeeded) {
                    setEditingGoalId(null);
                  }
                  return succeeded;
                }}
                onCancel={() => setEditingGoalId(null)}
              />
            ) : (
              <div className="goal-manage-list__summary">
                <div>
                  <strong>{goal.title}</strong>
                  <p>
                    {goal.startDate} 〜 {goal.endDate} / 進捗 {goal.progress}% /
                    {GOAL_STATUS_LABELS[goal.status]}
                  </p>
                </div>
                <div className="goal-manage-list__actions">
                  <button
                    type="button"
                    className="btn"
                    onClick={() => setEditingGoalId(goal.id)}
                  >
                    {GOAL_EDIT_BUTTON_LABEL}
                  </button>
                  {canDelete ? (
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => {
                        void onDelete(goal.id, user);
                      }}
                    >
                      {GOAL_DELETE_BUTTON_LABEL}
                    </button>
                  ) : null}
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
