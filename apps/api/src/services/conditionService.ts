import { ensureTrainee, ensureTrainer } from '../domain/authorization.js';
import {
  MONITORED_TRAINEE_IDS,
  CONDITION_FIELD,
  type ConditionField,
} from '../domain/conditionConstants.js';
import { buildConditionAlert } from '../domain/conditionAlert.js';
import {
  cloneConditionDraft,
  createSubmitResult,
  prepareConditionRecordForSave,
  updateConditionDraftField,
} from '../domain/conditionDraft.js';
import { buildConditionGraphData } from '../domain/conditionGraph.js';
import {
  requireLatestHistoryRecord,
  type TraineeHistoryTransform,
} from '../domain/conditionHistory.js';
import type {
  ConditionAlert,
  ConditionDraft,
  ConditionGraphData,
  ConditionHistoryRecord,
  ConditionSubmitResult,
} from '../domain/conditionTypes.js';
import type { UserContext } from '../domain/types.js';
import type { ConditionRecordStore } from '../repositories/conditionRecordStore.js';

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
    const recordToSave = prepareConditionRecordForSave(draft);
    await conditionRecordStore.save(context.userId, recordToSave);
    return createSubmitResult(recordToSave);
  }

  async getGraphData(
    traineeId: string,
    context: UserContext,
    conditionRecordStore: ConditionRecordStore,
  ): Promise<ConditionGraphData> {
    return this.withTraineeHistoryForTrainer(
      traineeId,
      context,
      conditionRecordStore,
      (_traineeId, records) => buildConditionGraphData(records),
    );
  }

  async getAlert(
    traineeId: string,
    context: UserContext,
    conditionRecordStore: ConditionRecordStore,
  ): Promise<ConditionAlert> {
    return this.withTraineeHistoryForTrainer(
      traineeId,
      context,
      conditionRecordStore,
      (id, records) => buildConditionAlert(id, records),
    );
  }

  async listAlerts(
    context: UserContext,
    conditionRecordStore: ConditionRecordStore,
  ): Promise<ConditionAlert[]> {
    ensureTrainer(context);

    return Promise.all(
      MONITORED_TRAINEE_IDS.map((traineeId) =>
        this.buildAlertForTrainee(traineeId, conditionRecordStore),
      ),
    );
  }

  async getLatestRecord(
    traineeId: string,
    context: UserContext,
    conditionRecordStore: ConditionRecordStore,
  ): Promise<ConditionHistoryRecord> {
    return this.withTraineeHistoryForTrainer(
      traineeId,
      context,
      conditionRecordStore,
      (id, records) => requireLatestHistoryRecord(id, records),
    );
  }

  private async buildAlertForTrainee(
    traineeId: string,
    conditionRecordStore: ConditionRecordStore,
  ): Promise<ConditionAlert> {
    const records = await this.loadTraineeHistory(
      traineeId,
      conditionRecordStore,
    );

    return buildConditionAlert(traineeId, records);
  }

  private async withTraineeHistoryForTrainer<T>(
    traineeId: string,
    context: UserContext,
    conditionRecordStore: ConditionRecordStore,
    transform: TraineeHistoryTransform<T>,
  ): Promise<T> {
    const records = await this.loadHistoryForTrainer(
      traineeId,
      context,
      conditionRecordStore,
    );

    return transform(traineeId, records);
  }

  private async loadTraineeHistory(
    traineeId: string,
    conditionRecordStore: ConditionRecordStore,
  ): Promise<ConditionHistoryRecord[]> {
    return conditionRecordStore.findHistoryByTraineeId(traineeId);
  }

  private async loadHistoryForTrainer(
    traineeId: string,
    context: UserContext,
    conditionRecordStore: ConditionRecordStore,
  ): Promise<ConditionHistoryRecord[]> {
    ensureTrainer(context);
    return this.loadTraineeHistory(traineeId, conditionRecordStore);
  }
}
