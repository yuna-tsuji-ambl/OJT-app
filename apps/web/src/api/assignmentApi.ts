import type {
  Assignment,
  CreateAssignmentInput,
  Quest,
  UpdateAssignmentInput,
} from '@ojt-app/shared';
import type { AuthUser } from '../auth/types';
import { fetchWithAuth } from './authHeaders';
import { parseJsonResponse } from './jsonResponse';

export type { Assignment, CreateAssignmentInput, Quest, UpdateAssignmentInput };

export async function fetchAssignmentList(user: AuthUser): Promise<Quest[]> {
  const response = await fetchWithAuth('/api/assignments', user);
  return parseJsonResponse(response, 'Failed to fetch assignment list');
}

export async function fetchAssignmentManageList(
  user: AuthUser,
): Promise<Assignment[]> {
  const response = await fetchWithAuth('/api/assignments/manage', user);
  return parseJsonResponse(response, 'Failed to fetch assignment manage list');
}

export async function fetchPendingAssignments(
  user: AuthUser,
): Promise<Quest[]> {
  const response = await fetchWithAuth('/api/assignments/pending', user);
  return parseJsonResponse(response, 'Failed to fetch pending assignments');
}

export async function requestAssignmentClear(
  assignmentId: string,
  user: AuthUser,
): Promise<Quest> {
  const response = await fetchWithAuth(
    `/api/assignments/${assignmentId}/request`,
    user,
    { method: 'POST' },
  );
  return parseJsonResponse(response, 'Failed to request assignment clear');
}

export async function approveAssignment(
  assignmentId: string,
  user: AuthUser,
): Promise<Quest> {
  const response = await fetchWithAuth(
    `/api/assignments/${assignmentId}/approve`,
    user,
    { method: 'POST' },
  );
  return parseJsonResponse(response, 'Failed to approve assignment');
}

export async function createAssignment(
  input: CreateAssignmentInput,
  user: AuthUser,
): Promise<Assignment> {
  const payload: CreateAssignmentInput = {
    ...input,
    dueDate: input.dueDate?.trim() ? input.dueDate.trim() : undefined,
  };
  const response = await fetchWithAuth('/api/assignments', user, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return parseJsonResponse(response, 'Failed to create assignment');
}

export async function updateAssignment(
  assignmentId: string,
  input: UpdateAssignmentInput,
  user: AuthUser,
): Promise<Assignment> {
  const response = await fetchWithAuth(
    `/api/assignments/${assignmentId}`,
    user,
    {
      method: 'PUT',
      body: JSON.stringify(input),
    },
  );
  return parseJsonResponse(response, 'Failed to update assignment');
}

export async function deleteAssignment(
  assignmentId: string,
  user: AuthUser,
): Promise<void> {
  const response = await fetchWithAuth(
    `/api/assignments/${assignmentId}`,
    user,
    {
      method: 'DELETE',
    },
  );

  if (!response.ok) {
    throw new Error('Failed to delete assignment');
  }
}
