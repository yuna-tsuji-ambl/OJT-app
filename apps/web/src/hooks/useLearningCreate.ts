import { useCallback, useState } from 'react';
import { createLearningPost } from '../api/learningApi';
import type { AuthUser } from '../auth/types';
import type {
  CreateLearningInput,
  LearningPersistFeedback,
  LearningPostResponse,
} from '../domain/learningForm';
import {
  LEARNING_CREATE_SUCCESS_MESSAGE,
  LEARNING_PERSIST_FAILED_MESSAGE,
} from '../domain/learningForm';

export function useLearningCreate() {
  const [feedback, setFeedback] = useState<LearningPersistFeedback>(null);
  const [submitting, setSubmitting] = useState(false);

  const createPost = useCallback(
    async (
      input: CreateLearningInput,
      authUser: AuthUser,
    ): Promise<LearningPostResponse | null> => {
      setSubmitting(true);
      try {
        const created = await createLearningPost(input, authUser);
        setFeedback({
          type: 'success',
          message: LEARNING_CREATE_SUCCESS_MESSAGE,
        });
        return created;
      } catch {
        setFeedback({
          type: 'error',
          message: LEARNING_PERSIST_FAILED_MESSAGE,
        });
        return null;
      } finally {
        setSubmitting(false);
      }
    },
    [],
  );

  const clearFeedback = useCallback(() => {
    setFeedback(null);
  }, []);

  return {
    feedback,
    submitting,
    createPost,
    clearFeedback,
  };
}
