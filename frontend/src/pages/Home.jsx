import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StoryList from '../components/StoryList';
import { getPosts } from '../services/api';

function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

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
          console.error('Failed to load home stories:', err);
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
    <div className="home-page">
      {/* Editorial Magazine Cover Header */}
      <section className="hero-section" aria-labelledby="hero-heading">
        <div className="hero-content motion-fade-up">
          <div className="hero-kicker">
            <span className="hero-issue-tag">Vol. 01</span>
            <span className="hero-kicker-divider">•</span>
            <span className="hero-tag">Personal Journal & Essays</span>
          </div>

          <h1 id="hero-heading" className="hero-title">
            Where personal experiences become <span className="hero-title-highlight">editorial literature</span>.
          </h1>

          <p className="hero-description">
            INKA is an independent digital publication celebrating authentic storytelling,
            thoughtful memoirs, and artistic perspectives. Read curated narratives or craft your own piece.
          </p>

          <div className="hero-actions">
            <Link to="/journal" className="btn btn-primary btn-lg" role="button">
              Explore Journal <span aria-hidden="true">→</span>
            </Link>
            <Link to="/write" className="btn btn-outline btn-lg" role="button">
              Write a Story
            </Link>
          </div>
        </div>

        <div className="hero-card-preview motion-scale-in motion-stagger-2" aria-hidden="true">
          <div className="hero-card-accent-badge">Editorial Note</div>
          <h2 className="hero-card-preview-title">
            "Stories that breathe with personality, warmth, and craft."
          </h2>
          <p className="hero-card-preview-text">
            Every piece published in INKA is treated as a standalone work of art—designed with generous whitespace,
            classic serif typography, and distinct individuality.
          </p>
          <div className="hero-card-stamp">
            <span>INKA • EDITORIAL</span>
          </div>
        </div>
      </section>

      {/* Editorial Magazine Feed */}
      <section className="home-journal-section motion-fade-up motion-stagger-3" aria-labelledby="recent-heading">
        <div className="editorial-masthead-divider">
          <span className="masthead-line" />
          <span className="masthead-label">Curated Selection</span>
          <span className="masthead-line" />
        </div>

        <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="page-category-tag">Featured Volume</span>
            <h2 id="recent-heading" className="page-title">Stories From The Journal</h2>
          </div>
          <Link to="/journal" className="nav-link" style={{ textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.08em' }}>
            View Full Publication →
          </Link>
        </header>

        <StoryList
          posts={posts.slice(0, 6)}
          loading={loading}
          error={error}
          onRetry={handleRetry}
          emptyTitle="Nothing has been published yet."
          emptyMessage="No stories have been published yet. Be the first to compose an essay in INKA!"
          layout="magazine"
        />
      </section>

      {/* Editorial Manifesto Quote */}
      <section className="editorial-manifesto-banner motion-fade-up motion-stagger-4" aria-label="Editorial philosophy">
        <div className="manifesto-mark" aria-hidden="true">◆</div>
        <p className="manifesto-quote">
          “We believe that everyday reflections, essays, and human experiences deserve 
          the aesthetic care of a modern independent digital magazine.”
        </p>
        <span className="manifesto-author">— The INKA Publication Manifesto</span>
      </section>
    </div>
  );
}

export default Home;
