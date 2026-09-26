import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import { getPosts, deletePost } from '../services/api';
import { useAuth } from '../hooks/useAuth';

function MyStories() {
  const { user } = useAuth();
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    getPosts()
      .then((res) => {
        if (!isMounted) return;
        const allPosts = res.data || [];
        // Filter stories belonging to the authenticated user for presentation
        const userPosts = allPosts.filter(
          (post) => user && Number(post.user_id) === Number(user.id)
        );
        setMyPosts(userPosts);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Failed to load my stories:', err);
        setError('Unable to load your stories. Please try again.');
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user, retryCount]);

  const handleDelete = async (postId, postTitle) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${postTitle}"? This action cannot be undone.`
    );
    if (!confirmDelete) return;

    setDeletingId(postId);
    setDeleteError('');

    try {
      await deletePost(postId);
      setMyPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err) {
      console.error('Failed to delete story:', err);
      setDeleteError(
        err.response?.data?.message || 'Failed to remove story. Please try again.'
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setRetryCount((prev) => prev + 1);
  };

  const API_ROOT = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/api$/, '')
    : 'http://localhost:5000';

  if (loading) {
    return (
      <div className="state-container" role="status" aria-live="polite">
        <div className="loading-spinner" aria-hidden="true" />
        <h2 className="state-title">Loading your manuscripts…</h2>
        <p className="state-desc">Fetching all stories authored by you.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="state-container" role="alert">
        <h2 className="state-title" style={{ color: 'var(--color-error)' }}>
          Unable to Load Stories
        </h2>
        <p className="state-desc">{error}</p>
        <Button variant="primary" size="sm" onClick={handleRetry}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="my-stories-page">
      <header className="page-header motion-fade-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="editorial-journey-kicker" style={{ marginBottom: '0.5rem' }}>
            <span className="editorial-journey-step active">Author Portfolio</span>
            <span className="editorial-journey-arrow">•</span>
            <span className="editorial-journey-step">{myPosts.length} Published Manuscripts</span>
          </div>
          <h1 className="page-title">My Stories & Archive</h1>
          <p className="page-subtitle">
            Manage, revise, and curate all the stories and essays you have contributed to INKA.
          </p>
        </div>
        <Link to="/write" className="btn btn-primary btn-md">
          Write New Story <span aria-hidden="true">→</span>
        </Link>
      </header>

      {deleteError && (
        <div className="alert-error" role="alert" style={{ maxWidth: '900px', margin: '0 auto 1.5rem auto' }}>
          <span>⚠️</span>
          <span>{deleteError}</span>
        </div>
      )}

      {myPosts.length === 0 ? (
        <div className="state-container">
          <div className="manifesto-mark" aria-hidden="true" style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>✍️</div>
          <h3 className="state-title">Your author archive is waiting for its first story.</h3>
          <p className="state-desc">
            You haven't published any pieces yet. Begin your storytelling journey and share your voice in the INKA journal.
          </p>
          <Link to="/write" className="btn btn-primary btn-md">
            Write Your First Story →
          </Link>
        </div>
      ) : (
        <div className="my-stories-list">
          {myPosts.map((post) => {
            const formattedDate = post.created_at
              ? new Date(post.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })
              : '';

            const fullImageUrl = post.image_url ? `${API_ROOT}${post.image_url}` : null;
            const isDeleting = deletingId === post.id;

            return (
              <article key={post.id} className="my-story-item">
                <div className="my-story-thumbnail-wrapper">
                  {fullImageUrl ? (
                    <img src={fullImageUrl} alt={post.title} className="my-story-thumbnail" />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, var(--color-soft-pink) 0%, var(--color-yellow) 100%)',
                        color: 'var(--color-dark-text)',
                        fontFamily: 'var(--font-display)',
                        fontWeight: 800,
                        fontSize: '1rem'
                      }}
                    >
                      INKA
                    </div>
                  )}
                </div>

                <div className="my-story-info">
                  <div className="my-story-date">{formattedDate}</div>
                  <h3 className="my-story-title">
                    <Link to={`/stories/${post.id}`}>{post.title}</Link>
                  </h3>
                  <p className="my-story-excerpt">{post.content}</p>
                </div>

                <div className="my-story-actions">
                  <Link to={`/stories/${post.id}`} className="btn btn-outline btn-sm">
                    Read
                  </Link>
                  <Link to={`/edit/${post.id}`} className="btn btn-soft btn-sm">
                    Edit
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="btn-danger-outline"
                    onClick={() => handleDelete(post.id, post.title)}
                    loading={isDeleting}
                    disabled={isDeleting}
                    aria-label={`Delete story: ${post.title}`}
                  >
                    Remove
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MyStories;
