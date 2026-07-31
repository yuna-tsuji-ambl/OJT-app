import {
  formatLearningDate,
  formatLearningLinkLabel,
  type LearningPostResponse,
} from '../domain/learningForm';

interface LearningPostCardProps {
  readonly post: LearningPostResponse;
}

export function LearningPostCard({ post }: LearningPostCardProps) {
  return (
    <article
      className="learning-card"
      aria-labelledby={`learning-card-title-${post.id}`}
      data-testid={`learning-card-${post.id}`}
    >
      <header className="learning-card__header">
        <time className="learning-card__date" dateTime={post.date}>
          {formatLearningDate(post.date)}
        </time>
        <h2
          className="learning-card__title"
          id={`learning-card-title-${post.id}`}
        >
          {post.title}
        </h2>
      </header>
      <p className="learning-card__body">{post.body}</p>
      {post.links.length > 0 ? (
        <ul className="learning-card__links" aria-label="参考リンク">
          {post.links.map((link) => (
            <li key={`${post.id}-${link.url}`}>
              <a
                className="learning-card__link"
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {formatLearningLinkLabel(link)}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}
