import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { LearningPostCard } from '../components/LearningPostCard';
import {
  LEARNING_CREATE_LINK_LABEL,
  LEARNING_CREATE_PATH,
  LEARNING_FEED_HEADING_ID,
  LEARNING_FEED_PAGE_TITLE,
  LEARNING_FEED_REGION_LABEL,
  LEARNING_CREATE_SUCCESS_MESSAGE,
} from '../domain/learningForm';
import { useLearnings } from '../hooks/useLearnings';

interface LearningFeedLocationState {
  readonly successMessage?: string;
}

export function LearningFeedPage() {
  const { user } = useAuth();
  const location = useLocation();
  const locationState = location.state as LearningFeedLocationState | null;
  const { learnings, loading, error } = useLearnings(user);

  if (!user) {
    return null;
  }

  const successMessage =
    locationState?.successMessage === LEARNING_CREATE_SUCCESS_MESSAGE
      ? locationState.successMessage
      : null;

  return (
    <section
      className="page-section learning-feed"
      aria-labelledby={LEARNING_FEED_HEADING_ID}
    >
      <div className="page-section__header">
        <h1 id={LEARNING_FEED_HEADING_ID}>{LEARNING_FEED_PAGE_TITLE}</h1>
        {user.role === 'trainee' ? (
          <Link to={LEARNING_CREATE_PATH} className="btn btn-primary">
            {LEARNING_CREATE_LINK_LABEL}
          </Link>
        ) : null}
      </div>
      {successMessage ? (
        <p
          className="learning-feedback learning-feedback--success"
          role="status"
          aria-label={successMessage}
        >
          {successMessage}
        </p>
      ) : null}
      {loading ? <p>読み込み中...</p> : null}
      {error ? (
        <p className="learning-form__error" role="alert">
          {error}
        </p>
      ) : null}
      {!loading ? (
        <div
          className="learning-feed__list"
          role="region"
          aria-label={LEARNING_FEED_REGION_LABEL}
        >
          {learnings.length === 0 ? (
            <p className="learning-feed__empty">まだ投稿がありません。</p>
          ) : (
            learnings.map((post) => (
              <LearningPostCard key={post.id} post={post} />
            ))
          )}
        </div>
      ) : null}
    </section>
  );
}
