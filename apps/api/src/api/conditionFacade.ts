import type {
  ConditionAlert,
  ConditionDraft,
  ConditionGraphData,
  ConditionHistoryRecord,
  ConditionSubmitResult,
} from '../domain/conditionTypes.js';
import type { UserRole } from '../domain/types.js';
import type { ConditionRecordStore } from '../repositories/conditionRecordStore.js';
import { ConditionService } from '../services/conditionService.js';
import {
  withConditionContext,
  withConditionStore,
  withTrainerTraineeStore,
} from './conditionStoreAccess.js';

const conditionService = new ConditionService();

const boundConditionService = {
  createDraft: conditionService.createDraft.bind(conditionService),
  updateMentalValue: conditionService.updateMentalValue.bind(conditionService),
  submitRecord: conditionService.submitRecord.bind(conditionService),
  getGraphData: conditionService.getGraphData.bind(conditionService),
  getAlert: conditionService.getAlert.bind(conditionService),
  listAlerts: conditionService.listAlerts.bind(conditionService),
  getLatestRecord: conditionService.getLatestRecord.bind(conditionService),
};

export function createConditionDraft(values: ConditionDraft): ConditionDraft {
  return boundConditionService.createDraft(values);
}

export function updateMentalValue(
  draft: ConditionDraft,
  mental: number,
  userId: string,
  role: UserRole,
): ConditionDraft {
  return withConditionContext(userId, role, (context) =>
    boundConditionService.updateMentalValue(draft, mental, context),
  );
}

export async function submitConditionRecord(
  draft: ConditionDraft,
  userId: string,
  role: UserRole,
  conditionRecordStore: ConditionRecordStore,
): Promise<ConditionSubmitResult> {
  return withConditionStore(
    userId,
    role,
    conditionRecordStore,
    (context, store) =>
      boundConditionService.submitRecord(draft, context, store),
  );
}

export async function getConditionGraphData(
  traineeId: string,
  userId: string,
  role: UserRole,
  conditionRecordStore: ConditionRecordStore,
): Promise<ConditionGraphData> {
  return withTrainerTraineeStore(
    traineeId,
    userId,
    role,
    conditionRecordStore,
    boundConditionService.getGraphData,
  );
}

export async function getConditionAlert(
  traineeId: string,
  userId: string,
  role: UserRole,
  conditionRecordStore: ConditionRecordStore,
): Promise<ConditionAlert> {
  return withTrainerTraineeStore(
    traineeId,
    userId,
    role,
    conditionRecordStore,
    boundConditionService.getAlert,
  );
}

export async function listConditionAlerts(
  userId: string,
  role: UserRole,
  conditionRecordStore: ConditionRecordStore,
): Promise<ConditionAlert[]> {
  return withConditionStore(
    userId,
    role,
    conditionRecordStore,
    boundConditionService.listAlerts,
  );
}

export async function getLatestConditionRecord(
  traineeId: string,
  userId: string,
  role: UserRole,
  conditionRecordStore: ConditionRecordStore,
): Promise<ConditionHistoryRecord> {
  return withTrainerTraineeStore(
    traineeId,
    userId,
    role,
    conditionRecordStore,
    boundConditionService.getLatestRecord,
  );
}
