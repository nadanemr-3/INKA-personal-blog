import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { getPost, deletePost } from '../services/api';
import { useAuth } from '../hooks/useAuth';

function StoryDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    let isMounted = true;

    getPost(id)
      .then((res) => {
        if (isMounted) {
          setPost(res.data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Failed to load story:', err);
          const status = err.response?.status;
          if (status === 404) {
            setError('This story does not exist or has been removed from the publication.');
          } else if (status === 400) {
            setError('The requested story link is invalid.');
          } else {
            setError('Unable to load this story right now. Please try again.');
          }
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id, retryCount]);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setRetryCount((prev) => prev + 1);
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this story? This action cannot be undone.'
    );
    if (!confirmDelete) return;

    setIsDeleting(true);
    setDeleteError('');

    try {
      await deletePost(id);
      navigate('/my-stories');
    } catch (err) {
      console.error('Failed to delete story:', err);
      setDeleteError(
        err.response?.data?.message || 'Failed to remove story. Please try again.'
      );
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="state-container" role="status" aria-live="polite">
        <div className="loading-spinner" aria-hidden="true" />
        <h2 className="state-title">Loading story…</h2>
        <p className="state-desc">Opening the article from the INKA archives.</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="state-container" role="alert">
        <h2 className="state-title" style={{ color: 'var(--color-error)' }}>
          Story Unavailable
        </h2>
        <p className="state-desc">{error || 'The requested story could not be found.'}</p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
          <Button variant="primary" size="sm" onClick={handleRetry}>
            Retry
          </Button>
          <Link to="/journal" className="btn btn-outline btn-sm">
            ← Return to Journal
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = user && post && Number(post.user_id) === Number(user.id);

  // API base for resolving relative image paths
  const API_ROOT = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/api$/, '')
    : 'http://localhost:5000';
  const fullImageUrl = post.image_url && !imageError ? `${API_ROOT}${post.image_url}` : null;

  // Format date helper
  const formattedDate = post.created_at
    ? new Date(post.created_at).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    : '';

  // Split content into clean paragraphs
  const paragraphs = (post.content || '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const authorInitial = (post.author_name || 'S').charAt(0).toUpperCase();

  return (
    <article className="story-details-page" aria-labelledby="story-article-title">
      {/* Author Action Toolbar if viewing own story */}
      {isOwner && (
        <aside className="story-details-author-toolbar" aria-label="Author controls">
          <span className="story-details-author-toolbar-tag">Author Controls</span>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to={`/edit/${post.id}`} className="btn btn-soft btn-sm">
              Edit Story
            </Link>
            <Button
              variant="outline"
              size="sm"
              className="btn-danger-outline"
              onClick={handleDelete}
              loading={isDeleting}
              disabled={isDeleting}
              aria-label="Delete this story"
            >
              Remove
            </Button>
          </div>
        </aside>
      )}

      {deleteError && (
        <div className="alert-error" role="alert" style={{ marginBottom: '1.5rem' }}>
          <span>⚠️</span>
          <span>{deleteError}</span>
        </div>
      )}

      {/* Magazine Article Header */}
      <header className="story-details-header motion-fade-up">
        <div className="story-details-kicker">
          <span className="story-details-issue-badge">INKA Publication</span>
          <span className="story-details-kicker-dot">•</span>
          <span className="story-details-genre">Personal Essay</span>
        </div>

        <h1 id="story-article-title" className="story-details-title">
          {post.title}
        </h1>

        <div className="story-details-byline">
          <span>Written by <strong className="story-author-badge">{post.author_name || 'Storyteller'}</strong></span>
          {formattedDate && (
            <>
              <span aria-hidden="true" className="byline-dot">•</span>
              <time dateTime={post.created_at}>{formattedDate}</time>
            </>
          )}
        </div>
      </header>

      {/* Cover Image Treatment */}
      {fullImageUrl && (
        <figure className="story-details-cover-wrapper motion-scale-in motion-stagger-1">
          <img
            src={fullImageUrl}
            alt={post.title || 'Story header image'}
            className="story-details-cover"
            onError={() => setImageError(true)}
          />
        </figure>
      )}

      {/* Story Content & Typographical Treatment */}
      <div className="story-details-body motion-fade-in motion-stagger-2">
        {paragraphs.length > 0 ? (
          paragraphs.map((para, index) => {
            // If article is long (3+ paragraphs), highlight 2nd paragraph as an editorial pull-quote if appropriate
            if (index === 1 && paragraphs.length >= 3 && para.length < 220) {
              return (
                <blockquote key={index} className="editorial-pullquote">
                  <p>{para}</p>
                </blockquote>
              );
            }
            return <p key={index}>{para}</p>;
          })
        ) : (
          <p>{post.content}</p>
        )}
      </div>

      {/* Editorial End Mark */}
      <div className="story-editorial-endmark motion-fade-in motion-stagger-3" aria-hidden="true">
        <span>◆</span>
        <span>◆</span>
        <span>◆</span>
      </div>

      {/* Author Byline & Publication Footer Box */}
      <footer className="story-author-box motion-fade-up motion-stagger-4">
        <div className="story-author-avatar" aria-hidden="true">
          {authorInitial}
        </div>
        <div style={{ flex: 1 }}>
          <span className="story-author-box-label">Storyteller</span>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', marginBottom: '0.25rem' }}>
            {post.author_name || 'Storyteller'}
          </h3>
          <p style={{ color: 'var(--color-muted-text)', fontSize: '0.875rem' }}>
            Published in INKA Independent Journal & Digital Publication.
          </p>
        </div>
        <div>
          <Link to="/journal" className="btn btn-outline btn-sm">
            ← Return to Journal
          </Link>
        </div>
      </footer>
    </article>
  );
}

export default StoryDetails;
