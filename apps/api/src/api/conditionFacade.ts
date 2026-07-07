import type {
  ConditionAlert,
  ConditionDraft,
  ConditionGraphData,
  ConditionHistoryRecord,
  ConditionPageAlert,
  ConditionSubmitResult,
} from '../domain/conditionTypes.js';
import type { UserContext, UserRole } from '../domain/types.js';
import { toUserContext } from '../domain/userContext.js';
import type { ConditionRecordStore } from '../repositories/conditionRecordStore.js';
import { ConditionService } from '../services/conditionService.js';

const conditionService = new ConditionService();

type StoreQuery<T> = (
  service: ConditionService,
  context: UserContext,
  store: ConditionRecordStore,
) => Promise<T>;

type TrainerTraineeQuery<T> = (
  service: ConditionService,
  traineeId: string,
  context: UserContext,
  store: ConditionRecordStore,
) => Promise<T>;

async function runWithStore<T>(
  userId: string,
  role: UserRole,
  store: ConditionRecordStore,
  query: StoreQuery<T>,
): Promise<T> {
  return query(conditionService, toUserContext(userId, role), store);
}

async function runTrainerTraineeQuery<T>(
  traineeId: string,
  userId: string,
  role: UserRole,
  store: ConditionRecordStore,
  query: TrainerTraineeQuery<T>,
): Promise<T> {
  return query(conditionService, traineeId, toUserContext(userId, role), store);
}

export function createConditionDraft(values: ConditionDraft): ConditionDraft {
  return conditionService.createDraft(values);
}

export function updateMentalValue(
  draft: ConditionDraft,
  mental: number,
  userId: string,
  role: UserRole,
): ConditionDraft {
  return conditionService.updateMentalValue(
    draft,
    mental,
    toUserContext(userId, role),
  );
}

export async function submitConditionRecord(
  draft: ConditionDraft,
  userId: string,
  role: UserRole,
  conditionRecordStore: ConditionRecordStore,
): Promise<ConditionSubmitResult> {
  return runWithStore(
    userId,
    role,
    conditionRecordStore,
    (service, context, store) => service.submitRecord(draft, context, store),
  );
}

export async function getConditionGraphData(
  traineeId: string,
  userId: string,
  role: UserRole,
  conditionRecordStore: ConditionRecordStore,
): Promise<ConditionGraphData> {
  return runTrainerTraineeQuery(
    traineeId,
    userId,
    role,
    conditionRecordStore,
    (service, id, context, store) => service.getGraphData(id, context, store),
  );
}

export async function getConditionAlert(
  traineeId: string,
  userId: string,
  role: UserRole,
  conditionRecordStore: ConditionRecordStore,
): Promise<ConditionAlert> {
  return runTrainerTraineeQuery(
    traineeId,
    userId,
    role,
    conditionRecordStore,
    (service, id, context, store) => service.getAlert(id, context, store),
  );
}

export async function listConditionAlerts(
  userId: string,
  role: UserRole,
  conditionRecordStore: ConditionRecordStore,
): Promise<ConditionAlert[]> {
  return runWithStore(
    userId,
    role,
    conditionRecordStore,
    (service, context, store) => service.listAlerts(context, store),
  );
}

export async function getLatestConditionRecord(
  traineeId: string,
  userId: string,
  role: UserRole,
  conditionRecordStore: ConditionRecordStore,
): Promise<ConditionHistoryRecord> {
  return runTrainerTraineeQuery(
    traineeId,
    userId,
    role,
    conditionRecordStore,
    (service, id, context, store) =>
      service.getLatestRecord(id, context, store),
  );
}

export async function getConditionPageAlert(
  traineeId: string,
  userId: string,
  role: UserRole,
  conditionRecordStore: ConditionRecordStore,
): Promise<ConditionPageAlert> {
  return runTrainerTraineeQuery(
    traineeId,
    userId,
    role,
    conditionRecordStore,
    (service, id, context, store) => service.getPageAlert(id, context, store),
  );
}
