import { useCallback, useEffect, useState } from 'react';
import { fetchLearnings } from '../api/learningApi';
import type { AuthUser } from '../auth/types';
import type { LearningPostResponse } from '../domain/learningForm';

export function useLearnings(user: AuthUser | null) {
  const [learnings, setLearnings] = useState<readonly LearningPostResponse[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reloadLearnings = useCallback(async (authUser: AuthUser) => {
    setLoading(true);
    setError(null);
    try {
      setLearnings(await fetchLearnings(authUser));
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Failed to fetch learnings',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }
    void reloadLearnings(user);
  }, [reloadLearnings, user]);

  return {
    learnings,
    loading,
    error,
    reloadLearnings,
  };
}
