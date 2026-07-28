import type { Quest } from '@ojt-app/shared';
import { useCallback, useEffect, useState } from 'react';
import {
  fetchAssignmentList,
  requestAssignmentClear,
} from '../api/assignmentApi';
import type { AuthUser } from '../auth/types';

export function useAssignmentList(user: AuthUser | null) {
  const [assignments, setAssignments] = useState<Quest[]>([]);

  const reloadAssignments = useCallback(async (authUser: AuthUser) => {
    setAssignments(await fetchAssignmentList(authUser));
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    void reloadAssignments(user);
  }, [reloadAssignments, user]);

  const requestClearAndReload = useCallback(
    async (assignmentId: string, authUser: AuthUser): Promise<void> => {
      await requestAssignmentClear(assignmentId, authUser);
      await reloadAssignments(authUser);
    },
    [reloadAssignments],
  );

  return { assignments, requestClearAndReload };
}
