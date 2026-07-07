import type {
  ConditionAlert,
  ConditionDraft,
  ConditionGraphData,
  ConditionHistoryRecord,
  ConditionSubmitResult,
} from '../domain/conditionTypes.js';
import type { UserContext, UserRole } from '../domain/types.js';
import { toUserContext } from '../domain/userContext.js';
import type { ConditionRecordStore } from '../repositories/conditionRecordStore.js';
import { ConditionService } from '../services/conditionService.js';

const conditionService = new ConditionService();

type ConditionStoreHandler<T> = (
  context: UserContext,
  conditionRecordStore: ConditionRecordStore,
) => Promise<T>;

async function withConditionStore<T>(
  userId: string,
  role: UserRole,
  conditionRecordStore: ConditionRecordStore,
  handler: ConditionStoreHandler<T>,
): Promise<T> {
  return handler(toUserContext(userId, role), conditionRecordStore);
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
  return withConditionStore(
    userId,
    role,
    conditionRecordStore,
    (context, store) => conditionService.submitRecord(draft, context, store),
  );
}

export async function getConditionGraphData(
  traineeId: string,
  userId: string,
  role: UserRole,
  conditionRecordStore: ConditionRecordStore,
): Promise<ConditionGraphData> {
  return withConditionStore(
    userId,
    role,
    conditionRecordStore,
    (context, store) =>
      conditionService.getGraphData(traineeId, context, store),
  );
}

export async function getConditionAlert(
  traineeId: string,
  userId: string,
  role: UserRole,
  conditionRecordStore: ConditionRecordStore,
): Promise<ConditionAlert> {
  return withConditionStore(
    userId,
    role,
    conditionRecordStore,
    (context, store) => conditionService.getAlert(traineeId, context, store),
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
    (context, store) => conditionService.listAlerts(context, store),
  );
}

export async function getLatestConditionRecord(
  traineeId: string,
  userId: string,
  role: UserRole,
  conditionRecordStore: ConditionRecordStore,
): Promise<ConditionHistoryRecord> {
  return withConditionStore(
    userId,
    role,
    conditionRecordStore,
    (context, store) =>
      conditionService.getLatestRecord(traineeId, context, store),
  );
}
