import { useState } from 'react';
import { Link } from 'react-router-dom';

function StoryCard({ post, variant = 'standard' }) {
  const [imageError, setImageError] = useState(false);

  if (!post) return null;

  const { id, title, content, author_name, image_url, created_at } = post;

  // Semantic date formatting
  const formattedDate = created_at
    ? new Date(created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : '';

  // Excerpt length based on card variant
  const excerptLimit =
    variant === 'featured'
      ? 260
      : variant === 'secondary'
      ? 150
      : variant === 'thought'
      ? 200
      : 110;

  const excerpt = content
    ? content.length > excerptLimit
      ? `${content.substring(0, excerptLimit).trim()}…`
      : content
    : '';

  // API base for resolving relative /uploads/... image paths
  const API_ROOT = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/api$/, '')
    : 'http://localhost:5000';
  const fullImageUrl = image_url && !imageError ? `${API_ROOT}${image_url}` : null;

  // -------------------------------------------------------------
  // VARIANT 1: FEATURED STORY (Level 1 — Cover Lead Piece)
  // -------------------------------------------------------------
  if (variant === 'featured') {
    return (
      <article className="featured-story-card">
        <div className="featured-story-image-wrapper">
          {fullImageUrl ? (
            <img
              src={fullImageUrl}
              alt={title || 'Featured story cover'}
              className="featured-story-image"
              loading="lazy"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="featured-story-image-placeholder" aria-hidden="true">
              <span className="featured-story-placeholder-brand">INKA</span>
              <span className="featured-story-placeholder-sub">Lead Editorial</span>
            </div>
          )}
        </div>

        <div className="featured-story-body">
          <div className="featured-story-header">
            <span className="featured-story-badge">Lead Feature</span>
            <div className="story-card-meta">
              <span className="story-card-author">{author_name || 'Storyteller'}</span>
              {formattedDate && (
                <>
                  <span aria-hidden="true">•</span>
                  <time dateTime={created_at}>{formattedDate}</time>
                </>
              )}
            </div>
          </div>

          <h2 className="featured-story-title">
            <Link to={`/stories/${id}`}>{title}</Link>
          </h2>

          <p className="featured-story-excerpt">{excerpt}</p>

          <div className="featured-story-footer">
            <Link to={`/stories/${id}`} className="btn btn-primary btn-md">
              Read Lead Story <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </article>
    );
  }

  // -------------------------------------------------------------
  // VARIANT 2: SECONDARY STORY (Level 2 — Supporting Article)
  // -------------------------------------------------------------
  if (variant === 'secondary') {
    return (
      <article className="secondary-story-card">
        {fullImageUrl ? (
          <div className="secondary-story-image-wrapper">
            <img
              src={fullImageUrl}
              alt={title || 'Secondary story cover'}
              className="secondary-story-image"
              loading="lazy"
              onError={() => setImageError(true)}
            />
          </div>
        ) : (
          <div className="secondary-story-placeholder" aria-hidden="true">
            <span>INKA ESSAY</span>
          </div>
        )}

        <div className="secondary-story-body">
          <div className="story-card-meta">
            <span className="story-card-author">{author_name || 'Storyteller'}</span>
            {formattedDate && (
              <>
                <span aria-hidden="true">•</span>
                <time dateTime={created_at}>{formattedDate}</time>
              </>
            )}
          </div>

          <h3 className="secondary-story-title">
            <Link to={`/stories/${id}`}>{title}</Link>
          </h3>

          <p className="secondary-story-excerpt">{excerpt}</p>

          <div className="story-card-footer">
            <Link to={`/stories/${id}`} className="story-card-link" aria-label={`Read story: ${title}`}>
              Read Essay <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </article>
    );
  }

  // -------------------------------------------------------------
  // VARIANT 3: SHORT THOUGHT / DISPATCH (Level 3 — Text-Led Piece)
  // -------------------------------------------------------------
  if (variant === 'thought') {
    return (
      <article className="thought-story-card">
        <div className="thought-story-mark" aria-hidden="true">“</div>
        <div className="thought-story-body">
          <div className="story-card-meta">
            <span className="story-card-tag-thought">Dispatch</span>
            <span className="story-card-author">{author_name || 'Storyteller'}</span>
            {formattedDate && (
              <>
                <span aria-hidden="true">•</span>
                <time dateTime={created_at}>{formattedDate}</time>
              </>
            )}
          </div>

          <h3 className="thought-story-title">
            <Link to={`/stories/${id}`}>{title}</Link>
          </h3>

          <p className="thought-story-excerpt">{excerpt}</p>

          <div className="thought-story-footer">
            <Link to={`/stories/${id}`} className="story-card-link" aria-label={`Read dispatch: ${title}`}>
              Open Dispatch <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </article>
    );
  }

  // -------------------------------------------------------------
  // VARIANT 4: VISUAL PIECE (Level 4 — Visual-Led Block)
  // -------------------------------------------------------------
  if (variant === 'visual' && fullImageUrl) {
    return (
      <article className="visual-story-card">
        <div className="visual-story-image-wrapper">
          <img
            src={fullImageUrl}
            alt={title || 'Visual story cover'}
            className="visual-story-image"
            loading="lazy"
            onError={() => setImageError(true)}
          />
          <div className="visual-story-overlay">
            <span className="visual-story-badge">Visual Feature</span>
            <div className="visual-story-content">
              <div className="story-card-meta" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                <span>{author_name || 'Storyteller'}</span>
                {formattedDate && (
                  <>
                    <span aria-hidden="true">•</span>
                    <time dateTime={created_at}>{formattedDate}</time>
                  </>
                )}
              </div>
              <h3 className="visual-story-title">
                <Link to={`/stories/${id}`}>{title}</Link>
              </h3>
              <Link to={`/stories/${id}`} className="btn btn-soft btn-sm" style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }}>
                View Story →
              </Link>
            </div>
          </div>
        </div>
      </article>
    );
  }

  // -------------------------------------------------------------
  // DEFAULT: STANDARD MAGAZINE CARD
  // -------------------------------------------------------------
  return (
    <article className="story-card">
      <div className="story-card-image-wrapper">
        {fullImageUrl ? (
          <img
            src={fullImageUrl}
            alt={title || 'Story cover image'}
            className="story-card-image"
            loading="lazy"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="story-card-image-placeholder" aria-hidden="true">
            <span>INKA</span>
          </div>
        )}
      </div>

      <div className="story-card-body">
        <div className="story-card-meta">
          <span className="story-card-author">{author_name || 'Storyteller'}</span>
          {formattedDate && (
            <>
              <span aria-hidden="true">•</span>
              <time dateTime={created_at}>{formattedDate}</time>
            </>
          )}
        </div>

        <h3 className="story-card-title">
          <Link to={`/stories/${id}`}>{title}</Link>
        </h3>

        <p className="story-card-excerpt">{excerpt}</p>

        <div className="story-card-footer">
          <Link to={`/stories/${id}`} className="story-card-link" aria-label={`Read story: ${title}`}>
            Read Story <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}

export default StoryCard;
