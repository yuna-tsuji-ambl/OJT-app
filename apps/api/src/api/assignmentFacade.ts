import type {
  Assignment,
  CreateAssignmentInput,
  UpdateAssignmentInput,
} from '../domain/assignmentTypes.js';
import type { Quest, UserRole } from '../domain/types.js';
import type { AssignmentRepository } from '../repositories/assignmentRepository.js';
import { AssignmentService } from '../services/assignmentService.js';
import { toUserContext } from '../domain/userContext.js';

const assignmentService = new AssignmentService();

export async function getAssignmentList(
  userId: string,
  role: UserRole,
  assignmentRepository: AssignmentRepository,
): Promise<Quest[]> {
  return assignmentService.listForTrainee(
    toUserContext(userId, role),
    assignmentRepository,
  );
}

export async function getAssignmentManageList(
  userId: string,
  role: UserRole,
  assignmentRepository: AssignmentRepository,
): Promise<Assignment[]> {
  return assignmentService.listForTrainerManage(
    toUserContext(userId, role),
    assignmentRepository,
  );
}

export async function createAssignment(
  userId: string,
  role: UserRole,
  input: CreateAssignmentInput,
  assignmentRepository: AssignmentRepository,
): Promise<Assignment> {
  return assignmentService.create(
    input,
    toUserContext(userId, role),
    assignmentRepository,
  );
}

export async function updateAssignment(
  assignmentId: string,
  userId: string,
  role: UserRole,
  input: UpdateAssignmentInput,
  assignmentRepository: AssignmentRepository,
): Promise<Assignment> {
  return assignmentService.update(
    assignmentId,
    input,
    toUserContext(userId, role),
    assignmentRepository,
  );
}

export async function deleteAssignment(
  assignmentId: string,
  userId: string,
  role: UserRole,
  assignmentRepository: AssignmentRepository,
): Promise<void> {
  await assignmentService.delete(
    assignmentId,
    toUserContext(userId, role),
    assignmentRepository,
  );
}

export async function requestClearAssignment(
  assignmentId: string,
  userId: string,
  role: UserRole,
  assignmentRepository: AssignmentRepository,
): Promise<Quest> {
  return assignmentService.requestClear(
    assignmentId,
    toUserContext(userId, role),
    assignmentRepository,
  );
}

export async function approveAssignment(
  assignmentId: string,
  userId: string,
  role: UserRole,
  assignmentRepository: AssignmentRepository,
): Promise<Quest> {
  return assignmentService.approve(
    assignmentId,
    toUserContext(userId, role),
    assignmentRepository,
  );
}

export async function getPendingAssignmentList(
  userId: string,
  role: UserRole,
  assignmentRepository: AssignmentRepository,
): Promise<Quest[]> {
  return assignmentService.listPending(
    toUserContext(userId, role),
    assignmentRepository,
  );
}
