import { useCallback, useEffect, useState } from 'react';
import { fetchGoals, updateGoal } from '../api/goalApi';
import type { AuthUser } from '../auth/types';
import type { GoalResponse, UpdateGoalInput } from '../domain/goalForm';

export function useGoals(user: AuthUser | null) {
  const [goals, setGoals] = useState<readonly GoalResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reloadGoals = useCallback(async (authUser: AuthUser) => {
    setLoading(true);
    setError(null);
    try {
      setGoals(await fetchGoals(authUser));
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Failed to fetch goals',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }
    void reloadGoals(user);
  }, [reloadGoals, user]);

  const updateGoalDates = useCallback(
    async (
      goalId: string,
      input: Pick<UpdateGoalInput, 'startDate' | 'endDate'>,
      authUser: AuthUser,
    ): Promise<void> => {
      try {
        const updated = await updateGoal(goalId, input, authUser);
        setError(null);
        setGoals((current) =>
          current.map((goal) => (goal.id === goalId ? updated : goal)),
        );
      } catch (updateError) {
        setError(
          updateError instanceof Error
            ? updateError.message
            : 'Failed to update goal dates',
        );
        throw updateError;
      }
    },
    [],
  );

  return {
    goals,
    loading,
    error,
    reloadGoals,
    updateGoalDates,
  };
}
