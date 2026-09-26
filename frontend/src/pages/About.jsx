import { Link } from 'react-router-dom';

function About() {
  return (
    <div className="about-page" style={{ maxWidth: '840px', margin: '0 auto' }}>
      <header className="page-header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div className="editorial-journey-kicker" style={{ justifyContent: 'center' }}>
          <span className="editorial-journey-step">Manifesto</span>
          <span className="editorial-journey-arrow">•</span>
          <span className="editorial-journey-step active">Philosophy</span>
        </div>
        <h1 className="page-title" style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)' }}>About INKA</h1>
        <p className="page-subtitle" style={{ margin: '0.75rem auto 0 auto', fontSize: '1.2rem' }}>
          An artistic, editorial publication dedicated to personal narratives, creative thought, and authentic voices.
        </p>
      </header>

      <section className="form-card" style={{ maxWidth: '100%', marginBottom: '2.5rem', padding: '3rem' }}>
        <div className="story-details-kicker" style={{ marginBottom: '1.25rem' }}>
          <span className="page-category-tag" style={{ backgroundColor: 'var(--color-bright-pink)', color: '#fff' }}>
            The Core Concept
          </span>
        </div>

        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: '1.25rem', color: 'var(--color-dark-text)', lineHeight: '1.2' }}>
          Personal stories presented as editorial art.
        </h2>

        <p style={{ marginBottom: '1.25rem', fontSize: '1.125rem', lineHeight: '1.8', color: 'var(--color-dark-text)' }}>
          INKA was created on the premise that everyday reflections, essays, and human experiences deserve 
          to be presented with the aesthetic care and visual dignity of a modern independent digital magazine.
        </p>

        <p style={{ marginBottom: '2rem', fontSize: '1.0625rem', lineHeight: '1.75', color: 'var(--color-muted-text)' }}>
          Whether documenting creative journeys, insightful essays, or personal memoirs, INKA provides a warm, 
          expressive, and playful platform for authentic storytelling without the clutter of social media algorithms.
        </p>

        <div className="about-values-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: '0.35rem', color: 'var(--color-bright-pink)' }}>01. Editorial First</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-muted-text)', lineHeight: '1.5' }}>
              Every article is framed with intentional typography, generous spacing, and thoughtful hierarchy.
            </p>
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: '0.35rem', color: 'var(--color-yellow)' }}>02. Authentic Voices</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-muted-text)', lineHeight: '1.5' }}>
              Real human experiences, unedited reflections, and personal perspectives.
            </p>
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: '0.35rem', color: 'var(--color-sky-blue)' }}>03. Playful Details</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-muted-text)', lineHeight: '1.5' }}>
              Delightful visual accents, warm color palettes, and expressive character.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/journal" className="btn btn-primary btn-md">
            Explore the Journal <span aria-hidden="true">→</span>
          </Link>
          <Link to="/write" className="btn btn-outline btn-md">
            Share Your Story
          </Link>
        </div>
      </section>
    </div>
  );
}

export default About;
