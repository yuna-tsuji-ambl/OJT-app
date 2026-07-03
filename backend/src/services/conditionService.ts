import { ensureTrainee, ensureTrainer } from '../domain/authorization.js';
import { CONDITION_FIELD } from '../domain/conditionConstants.js';
import {
  cloneConditionDraft,
  createSubmitResult,
  updateConditionDraftField,
} from '../domain/conditionDraft.js';
import { buildConditionAlert } from '../domain/conditionAlert.js';
import { buildConditionGraphData } from '../domain/conditionGraph.js';
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
    ensureTrainee(context);

    await conditionRecordStore.save(context.userId, draft);

    return createSubmitResult(draft);
  }

  async getGraphData(
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

  async getAlert(
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
}
