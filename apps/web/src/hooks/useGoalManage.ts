import { useCallback, useEffect, useState } from 'react';
import { createGoal, deleteGoal, fetchGoals, updateGoal } from '../api/goalApi';
import type { AuthUser } from '../auth/types';
import type {
  CreateGoalInput,
  GoalPersistFeedback,
  GoalResponse,
  UpdateGoalInput,
} from '../domain/goalForm';
import {
  GOAL_CREATE_SUCCESS_MESSAGE,
  GOAL_DELETE_SUCCESS_MESSAGE,
  GOAL_PERSIST_FAILED_MESSAGE,
  GOAL_UPDATE_SUCCESS_MESSAGE,
} from '../domain/goalForm';

export function useGoalManage(user: AuthUser | null) {
  const [goals, setGoals] = useState<readonly GoalResponse[]>([]);
  const [feedback, setFeedback] = useState<GoalPersistFeedback>(null);

  const reloadGoals = useCallback(async (authUser: AuthUser) => {
    setGoals(await fetchGoals(authUser));
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }
    void reloadGoals(user);
  }, [reloadGoals, user]);

  const createGoalAndReload = useCallback(
    async (input: CreateGoalInput, authUser: AuthUser): Promise<boolean> => {
      try {
        await createGoal(input, authUser);
        await reloadGoals(authUser);
        setFeedback({ type: 'success', message: GOAL_CREATE_SUCCESS_MESSAGE });
        return true;
      } catch {
        setFeedback({ type: 'error', message: GOAL_PERSIST_FAILED_MESSAGE });
        return false;
      }
    },
    [reloadGoals],
  );

  const updateGoalAndReload = useCallback(
    async (
      goalId: string,
      input: UpdateGoalInput,
      authUser: AuthUser,
    ): Promise<boolean> => {
      try {
        await updateGoal(goalId, input, authUser);
        await reloadGoals(authUser);
        setFeedback({ type: 'success', message: GOAL_UPDATE_SUCCESS_MESSAGE });
        return true;
      } catch {
        setFeedback({ type: 'error', message: GOAL_PERSIST_FAILED_MESSAGE });
        return false;
      }
    },
    [reloadGoals],
  );

  const deleteGoalAndReload = useCallback(
    async (goalId: string, authUser: AuthUser): Promise<boolean> => {
      try {
        await deleteGoal(goalId, authUser);
        await reloadGoals(authUser);
        setFeedback({ type: 'success', message: GOAL_DELETE_SUCCESS_MESSAGE });
        return true;
      } catch {
        setFeedback({ type: 'error', message: GOAL_PERSIST_FAILED_MESSAGE });
        return false;
      }
    },
    [reloadGoals],
  );

  const clearFeedback = useCallback(() => {
    setFeedback(null);
  }, []);

  return {
    goals,
    feedback,
    clearFeedback,
    reloadGoals,
    createGoalAndReload,
    updateGoalAndReload,
    deleteGoalAndReload,
  };
}
