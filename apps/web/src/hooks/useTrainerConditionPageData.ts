import { useEffect, useState } from 'react';
import {
  fetchConditionGraphData,
  fetchConditionPageAlert,
  fetchLatestConditionRecord,
  type ConditionGraphData,
  type ConditionHistoryRecord,
  type ConditionPageAlert,
} from '../api/conditionApi';
import type { AuthUser } from '../auth/types';
import { DEFAULT_TRAINEE_ID } from '../domain/statusConstants';

export interface TrainerConditionPageData {
  record: ConditionHistoryRecord | null;
  graphData: ConditionGraphData | null;
  pageAlert: ConditionPageAlert | null;
}

export function useTrainerConditionPageData(
  user: AuthUser | null,
  traineeId: string = DEFAULT_TRAINEE_ID,
): TrainerConditionPageData {
  const [record, setRecord] = useState<ConditionHistoryRecord | null>(null);
  const [graphData, setGraphData] = useState<ConditionGraphData | null>(null);
  const [pageAlert, setPageAlert] = useState<ConditionPageAlert | null>(null);

  useEffect(() => {
    if (!user) {
      return;
    }

    void Promise.all([
      fetchLatestConditionRecord(traineeId, user).then(setRecord),
      fetchConditionGraphData(traineeId, user).then(setGraphData),
      fetchConditionPageAlert(traineeId, user).then(setPageAlert),
    ]);
  }, [traineeId, user]);

  return { record, graphData, pageAlert };
}
