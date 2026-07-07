import type { CreateQuestInput } from '@ojt-app/shared';
import { useCallback, useEffect, useState } from 'react';
import { fetchConditionAlerts, type ConditionAlert } from '../api/conditionApi';
import {
  approveQuest,
  createQuest,
  fetchPendingQuests,
  fetchTrainerQuestProgress,
  type Quest,
} from '../api/questApi';
import type { AuthUser } from '../auth/types';

export function useTrainerDashboard(user: AuthUser | null) {
  const [alerts, setAlerts] = useState<ConditionAlert[]>([]);
  const [pendingQuests, setPendingQuests] = useState<Quest[]>([]);
  const [progressQuests, setProgressQuests] = useState<Quest[]>([]);

  const reloadPendingQuests = useCallback(async (authUser: AuthUser) => {
    setPendingQuests(await fetchPendingQuests(authUser));
  }, []);

  const reloadProgressQuests = useCallback(async (authUser: AuthUser) => {
    setProgressQuests(await fetchTrainerQuestProgress(authUser));
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
      await approveQuest(questId, authUser);
      await Promise.all([
        reloadPendingQuests(authUser),
        reloadProgressQuests(authUser),
      ]);
    },
    [reloadPendingQuests, reloadProgressQuests],
  );

  const createQuestAndReload = useCallback(
    async (input: CreateQuestInput, authUser: AuthUser): Promise<void> => {
      await createQuest(input, authUser);
      await reloadProgressQuests(authUser);
    },
    [reloadProgressQuests],
  );

  return {
    alerts,
    pendingQuests,
    progressQuests,
    approveQuestAndReload,
    createQuestAndReload,
  };
}
