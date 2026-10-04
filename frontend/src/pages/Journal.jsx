import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StoryList from '../components/StoryList';
import { getPosts } from '../services/api';
import { useReveal } from '../hooks/useReveal';

function Journal() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const rootRef = useReveal([loading]);

  useEffect(() => {
    let isMounted = true;

    getPosts()
      .then((res) => {
        if (isMounted) {
          setPosts(res.data || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Failed to load journal stories:', err);
          setError('We encountered a problem connecting to the server. Please try again.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [retryCount]);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setRetryCount((prev) => prev + 1);
  };

  return (
    <div className="journal-page" ref={rootRef}>
      {/* Journal Publication Masthead */}
      <header className="journal-masthead motion-fade-up">
        <div className="journal-masthead-top">
          <span className="journal-masthead-issue">INKA JOURNAL • ISSUE 01</span>
          <span className="journal-masthead-motto">Independent Digital Publication</span>
        </div>

        <h1 className="journal-masthead-title">The Journal</h1>

        <p className="journal-masthead-desc">
          An ongoing archive of personal essays, memoirs, creative observations, and artistic reflections.
        </p>

        <div className="journal-masthead-bar">
          <span className="journal-bar-item active">All Publications ({posts.length})</span>
          <span className="journal-bar-divider">/</span>
          <span className="journal-bar-note">Curated Newest First</span>
        </div>
      </header>

      <div className="journal-list">
        <StoryList
          posts={posts}
          loading={loading}
          error={error}
          onRetry={handleRetry}
          emptyTitle="Nothing has been published yet."
          emptyMessage="The journal is currently quiet. Be among the first to share an essay or story."
          layout="magazine"
        />
      </div>

      {/* Journal Editorial Sign-Off */}
      {!loading && !error && posts.length > 0 && (
        <section className="journal-closing-section">
          <div className="journal-closing-box" data-reveal="up">
            <span className="journal-closing-stamp">INKA • SUBMISSIONS</span>
            <h3 className="journal-closing-title">Have a story to tell?</h3>
            <p className="journal-closing-desc">
              Whether a brief dispatch, personal essay, or visual reflection, INKA is an open canvas for your voice.
            </p>
            <Link to="/write" className="btn btn-primary btn-md">
              Write Your Story <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}

export default Journal;
