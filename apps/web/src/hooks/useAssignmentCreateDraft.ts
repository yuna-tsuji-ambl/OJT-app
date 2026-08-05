import type { CreateAssignmentInput } from '@ojt-app/shared';
import { useCallback, useState } from 'react';
import { EMPTY_ASSIGNMENT_DRAFT } from '../domain/assignmentFormFields';

export function useAssignmentCreateDraft(
  initialDraft: CreateAssignmentInput = EMPTY_ASSIGNMENT_DRAFT,
) {
  const [draft, setDraft] = useState<CreateAssignmentInput>(initialDraft);

  const updateField = useCallback(
    (key: keyof CreateAssignmentInput, value: string) => {
      setDraft((current) => ({
        ...current,
        [key]: value,
      }));
    },
    [],
  );

  const resetDraft = useCallback(() => {
    setDraft(initialDraft);
  }, [initialDraft]);

  const setDraftValues = useCallback((nextDraft: CreateAssignmentInput) => {
    setDraft(nextDraft);
  }, []);

  return {
    draft,
    updateField,
    resetDraft,
    setDraftValues,
  };
}
