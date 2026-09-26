import StoryCard from './StoryCard';
import Button from './Button';

function StoryList({
  posts = [],
  loading = false,
  error = null,
  onRetry = null,
  emptyTitle = 'Nothing has been published yet.',
  emptyMessage = 'The journal is currently quiet. Check back soon for new personal stories and editorial essays.',
  layout = 'magazine'
}) {
  if (loading) {
    return (
      <div className="state-container" role="status" aria-live="polite">
        <div className="loading-spinner" aria-hidden="true" />
        <h3 className="state-title">Loading stories…</h3>
        <p className="state-desc">Fetching the latest editorial reflections and dispatches.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="state-container" role="alert">
        <h3 className="state-title" style={{ color: 'var(--color-error)' }}>
          We couldn't load the Journal right now.
        </h3>
        <p className="state-desc">
          {typeof error === 'string' ? error : 'A connection error occurred while loading articles.'}
        </p>
        {onRetry && (
          <Button variant="primary" size="sm" onClick={onRetry}>
            Try Again
          </Button>
        )}
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="state-container">
        <h3 className="state-title">{emptyTitle}</h3>
        <p className="state-desc">{emptyMessage}</p>
      </div>
    );
  }

  // Flat grid layout if explicitly requested
  if (layout === 'grid') {
    return (
      <div className="story-grid">
        {posts.map((post) => (
          <StoryCard key={post.id} post={post} variant="standard" />
        ))}
      </div>
    );
  }

  // -------------------------------------------------------------
  // EDITORIAL MAGAZINE COMPOSITION
  // -------------------------------------------------------------
  // Post 0: Lead Featured Story (Level 1)
  // Posts 1 & 2: Secondary Articles (Level 2)
  // Posts 3 & 4: Visual Pieces (Level 4) or Dispatches (Level 3)
  // Posts 5+: The Archive (Standard Grid)
  const featuredPost = posts[0];
  const secondaryPosts = posts.slice(1, 3);
  const midPosts = posts.slice(3, 5);
  const archivePosts = posts.slice(5);

  return (
    <div className="editorial-story-container">
      {/* 1. Lead Featured Story (Level 1) */}
      {featuredPost && <div className="motion-scale-in"><StoryCard post={featuredPost} variant="featured" /></div>}

      {/* 2. Secondary Supporting Stories (Level 2) */}
      {secondaryPosts.length > 0 && (
        <section aria-label="Curated Essays" className="editorial-section motion-fade-up motion-stagger-1">
          <div className="editorial-section-header">
            <span className="editorial-section-kicker">Section 01</span>
            <h2 className="editorial-section-title">Curated Essays & Narratives</h2>
            <span className="editorial-section-count">{secondaryPosts.length} Pieces</span>
          </div>
          <div className="secondary-story-grid">
            {secondaryPosts.map((post) => (
              <StoryCard key={post.id} post={post} variant="secondary" />
            ))}
          </div>
        </section>
      )}

      {/* 3. Dispatches & Visual Pieces (Levels 3 & 4) */}
      {midPosts.length > 0 && (
        <section aria-label="Dispatches and Visual Stories" className="editorial-section motion-fade-up motion-stagger-2">
          <div className="editorial-section-header">
            <span className="editorial-section-kicker">Section 02</span>
            <h2 className="editorial-section-title">Dispatches & Perspectives</h2>
            <span className="editorial-section-count">{midPosts.length} Entries</span>
          </div>
          <div className="editorial-asymmetric-row">
            {midPosts.map((post, idx) => {
              // If post has an image, render as Level 4 Visual Piece; otherwise as Level 3 Thought
              const variant = post.image_url ? 'visual' : 'thought';
              return (
                <StoryCard
                  key={post.id}
                  post={post}
                  variant={variant === 'visual' && idx === 0 ? 'visual' : 'thought'}
                />
              );
            })}
          </div>
        </section>
      )}

      {/* 4. Complete Archive / Additional Stories */}
      {archivePosts.length > 0 && (
        <section aria-label="Journal Archive" className="editorial-section motion-fade-up motion-stagger-3" style={{ marginTop: '3.5rem' }}>
          <div className="editorial-section-header">
            <span className="editorial-section-kicker">Section 03</span>
            <h2 className="editorial-section-title">The Journal Archive</h2>
            <span className="editorial-section-count">{archivePosts.length} Additional Stories</span>
          </div>
          <div className="story-grid">
            {archivePosts.map((post) => (
              <StoryCard key={post.id} post={post} variant="standard" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default StoryList;
