import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { LearningCreateForm } from '../components/LearningCreateForm';
import {
  LEARNING_CREATE_HEADING_ID,
  LEARNING_CREATE_PAGE_TITLE,
  LEARNING_CREATE_REGION_LABEL,
  LEARNING_CREATE_SUCCESS_MESSAGE,
  LEARNING_FEED_PATH,
  type CreateLearningInput,
} from '../domain/learningForm';
import { useLearningCreate } from '../hooks/useLearningCreate';

export function LearningCreatePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { feedback, submitting, createPost } = useLearningCreate();

  if (!user) {
    return null;
  }

  if (user.role !== 'trainee') {
    return <Navigate to={LEARNING_FEED_PATH} replace />;
  }

  const handleSubmit = async (input: CreateLearningInput): Promise<boolean> => {
    const created = await createPost(input, user);
    if (!created) {
      return false;
    }

    navigate(LEARNING_FEED_PATH, {
      state: { successMessage: LEARNING_CREATE_SUCCESS_MESSAGE },
    });
    return true;
  };

  return (
    <section
      className="page-section learning-create-page"
      aria-labelledby={LEARNING_CREATE_HEADING_ID}
    >
      <h1 id={LEARNING_CREATE_HEADING_ID}>{LEARNING_CREATE_PAGE_TITLE}</h1>
      {feedback?.type === 'error' ? (
        <p className="learning-feedback learning-feedback--error" role="alert">
          {feedback.message}
        </p>
      ) : null}
      <LearningCreateForm
        regionLabel={LEARNING_CREATE_REGION_LABEL}
        submitting={submitting}
        onSubmit={handleSubmit}
      />
    </section>
  );
}
