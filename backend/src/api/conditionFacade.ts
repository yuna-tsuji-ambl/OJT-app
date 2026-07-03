import type {
  ConditionAlert,
  ConditionDraft,
  ConditionGraphData,
  ConditionSubmitResult,
} from '../domain/conditionTypes.js';
import type { UserRole } from '../domain/types.js';
import { toUserContext } from '../domain/userContext.js';
import type { ConditionRecordStore } from '../repositories/conditionRecordStore.js';
import { ConditionService } from '../services/conditionService.js';

const conditionService = new ConditionService();

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
  return conditionService.submitRecord(
    draft,
    toUserContext(userId, role),
    conditionRecordStore,
  );
}

export async function getConditionGraphData(
  traineeId: string,
  userId: string,
  role: UserRole,
  conditionRecordStore: ConditionRecordStore,
): Promise<ConditionGraphData> {
  return conditionService.getGraphData(
    traineeId,
    toUserContext(userId, role),
    conditionRecordStore,
  );
}

export async function getConditionAlert(
  traineeId: string,
  userId: string,
  role: UserRole,
  conditionRecordStore: ConditionRecordStore,
): Promise<ConditionAlert> {
  return conditionService.getAlert(
    traineeId,
    toUserContext(userId, role),
    conditionRecordStore,
  );
}
