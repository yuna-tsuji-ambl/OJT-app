import { useCallback, useEffect, useState } from 'react';
import { fetchConditionAlerts, type ConditionAlert } from '../api/conditionApi';
import {
  approveAssignment,
  fetchAssignmentManageList,
  fetchPendingAssignments,
  type Quest,
} from '../api/assignmentApi';
import { assignmentToQuest } from '../domain/assignmentDisplay';
import type { AuthUser } from '../auth/types';

export function useTrainerDashboard(user: AuthUser | null) {
  const [alerts, setAlerts] = useState<ConditionAlert[]>([]);
  const [pendingQuests, setPendingQuests] = useState<Quest[]>([]);
  const [progressQuests, setProgressQuests] = useState<Quest[]>([]);

  const reloadPendingQuests = useCallback(async (authUser: AuthUser) => {
    setPendingQuests(await fetchPendingAssignments(authUser));
  }, []);

  const reloadProgressQuests = useCallback(async (authUser: AuthUser) => {
    const assignments = await fetchAssignmentManageList(authUser);
    setProgressQuests(assignments.map(assignmentToQuest));
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    void fetchConditionAlerts(user).then(setAlerts);
    void reloadPendingQuests(user);
    void reloadProgressQuests(user);
  }, [reloadPendingQuests, reloadProgressQuests, user]);

  const approveQuestAndReload = useCallback(
    async (questId: string, authUser: AuthUser): Promise<void> => {
      await approveAssignment(questId, authUser);
      await Promise.all([
        reloadPendingQuests(authUser),
        reloadProgressQuests(authUser),
      ]);
    },
    [reloadPendingQuests, reloadProgressQuests],
  );

  return {
    alerts,
    pendingQuests,
    progressQuests,
    approveQuestAndReload,
  };
}
