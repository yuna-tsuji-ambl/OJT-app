import { useCallback, useEffect, useState } from 'react';
import { fetchQuestList, requestQuestClear, type Quest } from '../api/questApi';
import type { AuthUser } from '../auth/types';

export function useQuestList(user: AuthUser | null) {
  const [quests, setQuests] = useState<Quest[]>([]);

  const reloadQuests = useCallback(async (authUser: AuthUser) => {
    setQuests(await fetchQuestList(authUser));
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    void reloadQuests(user);
  }, [reloadQuests, user]);

  const requestClearAndReload = useCallback(
    async (questId: string, authUser: AuthUser): Promise<void> => {
      await requestQuestClear(questId, authUser);
      await reloadQuests(authUser);
    },
    [reloadQuests],
  );

  return { quests, requestClearAndReload };
}
