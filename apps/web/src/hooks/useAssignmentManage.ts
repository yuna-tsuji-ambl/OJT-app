import type { Assignment, CreateAssignmentInput } from '@ojt-app/shared';
import { useCallback, useEffect, useState } from 'react';
import {
  createAssignment,
  deleteAssignment,
  fetchAssignmentManageList,
  updateAssignment,
} from '../api/assignmentApi';
import type { AuthUser } from '../auth/types';
import { toUpdateAssignmentInput } from '../domain/assignmentFormFields';

export function useAssignmentManage(user: AuthUser | null) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  const reloadAssignments = useCallback(async (authUser: AuthUser) => {
    setAssignments(await fetchAssignmentManageList(authUser));
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    void reloadAssignments(user);
  }, [reloadAssignments, user]);

  const createAssignmentAndReload = useCallback(
    async (input: CreateAssignmentInput, authUser: AuthUser): Promise<void> => {
      await createAssignment(input, authUser);
      await reloadAssignments(authUser);
    },
    [reloadAssignments],
  );

  const updateAssignmentAndReload = useCallback(
    async (
      assignmentId: string,
      input: CreateAssignmentInput,
      authUser: AuthUser,
    ): Promise<void> => {
      await updateAssignment(
        assignmentId,
        toUpdateAssignmentInput(input),
        authUser,
      );
      await reloadAssignments(authUser);
    },
    [reloadAssignments],
  );

  const deleteAssignmentAndReload = useCallback(
    async (assignmentId: string, authUser: AuthUser): Promise<void> => {
      await deleteAssignment(assignmentId, authUser);
      await reloadAssignments(authUser);
    },
    [reloadAssignments],
  );

  return {
    assignments,
    createAssignmentAndReload,
    updateAssignmentAndReload,
    deleteAssignmentAndReload,
  };
}
