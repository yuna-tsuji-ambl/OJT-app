import { ensureTrainee, ensureTrainer } from '../domain/authorization.js';
import {
  MONITORED_TRAINEE_IDS,
  CONDITION_FIELD,
} from '../domain/conditionConstants.js';
import { buildConditionAlert } from '../domain/conditionAlert.js';
import {
  cloneConditionDraft,
  createSubmitResult,
  updateConditionDraftField,
} from '../domain/conditionDraft.js';
import { buildConditionGraphData } from '../domain/conditionGraph.js';
import { requireLatestHistoryRecord } from '../domain/conditionHistory.js';
import type {
  ConditionAlert,
  ConditionDraft,
  ConditionGraphData,
  ConditionHistoryRecord,
  ConditionSubmitResult,
} from '../domain/conditionTypes.js';
import type { ConditionField } from '../domain/conditionConstants.js';
import type { UserContext } from '../domain/types.js';
import type { ConditionRecordStore } from '../repositories/conditionRecordStore.js';

async function loadTraineeHistory(
  traineeId: string,
  conditionRecordStore: ConditionRecordStore,
): Promise<ConditionHistoryRecord[]> {
  return conditionRecordStore.findHistoryByTraineeId(traineeId);
}

async function loadHistoryForTrainer(
  traineeId: string,
  context: UserContext,
  conditionRecordStore: ConditionRecordStore,
): Promise<ConditionHistoryRecord[]> {
  ensureTrainer(context);
  return loadTraineeHistory(traineeId, conditionRecordStore);
}

async function persistConditionRecord(
  userId: string,
  draft: ConditionDraft,
  conditionRecordStore: ConditionRecordStore,
): Promise<ConditionSubmitResult> {
  await conditionRecordStore.save(userId, draft);
  return createSubmitResult(draft);
}

async function submitRecordForTrainee(
  draft: ConditionDraft,
  context: UserContext,
  conditionRecordStore: ConditionRecordStore,
): Promise<ConditionSubmitResult> {
  ensureTrainee(context);
  return persistConditionRecord(context.userId, draft, conditionRecordStore);
}

async function getGraphDataForTrainer(
  traineeId: string,
  context: UserContext,
  conditionRecordStore: ConditionRecordStore,
): Promise<ConditionGraphData> {
  const records = await loadHistoryForTrainer(
    traineeId,
    context,
    conditionRecordStore,
  );

  return buildConditionGraphData(records);
}

async function getAlertForTrainer(
  traineeId: string,
  context: UserContext,
  conditionRecordStore: ConditionRecordStore,
): Promise<ConditionAlert> {
  const records = await loadHistoryForTrainer(
    traineeId,
    context,
    conditionRecordStore,
  );

  return buildConditionAlert(traineeId, records);
}

async function listAlertsForTrainer(
  context: UserContext,
  conditionRecordStore: ConditionRecordStore,
): Promise<ConditionAlert[]> {
  ensureTrainer(context);

  return Promise.all(
    MONITORED_TRAINEE_IDS.map(async (traineeId) => {
      const records = await loadTraineeHistory(traineeId, conditionRecordStore);
      return buildConditionAlert(traineeId, records);
    }),
  );
}

async function getLatestRecordForTrainer(
  traineeId: string,
  context: UserContext,
  conditionRecordStore: ConditionRecordStore,
): Promise<ConditionHistoryRecord> {
  const records = await loadHistoryForTrainer(
    traineeId,
    context,
    conditionRecordStore,
  );

  return requireLatestHistoryRecord(traineeId, records);
}

export class ConditionService {
  createDraft(values: ConditionDraft): ConditionDraft {
    return cloneConditionDraft(values);
  }

  updateField(
    draft: ConditionDraft,
    field: ConditionField,
    value: number,
    context: UserContext,
  ): ConditionDraft {
    ensureTrainee(context);
    return updateConditionDraftField(draft, field, value);
  }

  updateMentalValue(
    draft: ConditionDraft,
    mental: number,
    context: UserContext,
  ): ConditionDraft {
    return this.updateField(draft, CONDITION_FIELD.MENTAL, mental, context);
  }

  async submitRecord(
    draft: ConditionDraft,
    context: UserContext,
    conditionRecordStore: ConditionRecordStore,
  ): Promise<ConditionSubmitResult> {
    return submitRecordForTrainee(draft, context, conditionRecordStore);
  }

  async getGraphData(
    traineeId: string,
    context: UserContext,
    conditionRecordStore: ConditionRecordStore,
  ): Promise<ConditionGraphData> {
    return getGraphDataForTrainer(traineeId, context, conditionRecordStore);
  }

  async getAlert(
    traineeId: string,
    context: UserContext,
    conditionRecordStore: ConditionRecordStore,
  ): Promise<ConditionAlert> {
    return getAlertForTrainer(traineeId, context, conditionRecordStore);
  }

  async listAlerts(
    context: UserContext,
    conditionRecordStore: ConditionRecordStore,
  ): Promise<ConditionAlert[]> {
    return listAlertsForTrainer(context, conditionRecordStore);
  }

  async getLatestRecord(
    traineeId: string,
    context: UserContext,
    conditionRecordStore: ConditionRecordStore,
  ): Promise<ConditionHistoryRecord> {
    return getLatestRecordForTrainer(traineeId, context, conditionRecordStore);
  }
}
