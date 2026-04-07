import './Landing.css';

const Landing = ({ onStart, onAbout }) => {
  return (
    <div className="landing-page">
      <div className="landing-bg" aria-hidden="true" />
      <div className="landing-inner">
        <header className="landing-header">
          <div className="landing-brand">
            <span className="landing-logo">IF</span>
            <span className="landing-brand-text">IdeaForge</span>
          </div>
        </header>

        <main className="landing-main">
          <p className="landing-eyebrow">Product ideation studio</p>
          <h1 className="landing-title">
            Turn rough ideas into
            <span className="landing-title-accent"> clear, scored concepts</span>
          </h1>
          <p className="landing-lede">
            Evaluate your idea with AI, see where it is strong or weak, then forge a sharper version
            you can pitch, design, or build — all in one flow.
          </p>

          <div className="landing-pills" role="list">
            <span className="landing-pill" role="listitem">Score &amp; feedback</span>
            <span className="landing-pill" role="listitem">AI rewrite</span>
            <span className="landing-pill" role="listitem">UI blueprint</span>
          </div>

          <div className="landing-actions">
            <button type="button" className="landing-btn landing-btn--primary" onClick={onStart}>
              Start with your idea
              <span className="landing-btn-arrow" aria-hidden="true">→</span>
            </button>
            <button type="button" className="landing-btn landing-btn--secondary" onClick={onAbout}>
              Learn about IdeaForge
            </button>
          </div>

          <p className="landing-hint">New here? Use the second button for a quick tour — no signup.</p>
        </main>

        <footer className="landing-footer">
          <span>Light, fast, built for builders &amp; students</span>
        </footer>
      </div>
    </div>
  );
};

export default Landing;
