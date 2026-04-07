import { useState } from 'react';
import './About.css';

const sections = [
  {
    id: 'what',
    title: 'What IdeaForge does',
    body:
      'You describe a product idea in plain language. IdeaForge scores it on problem validity, market demand, uniqueness, and feasibility — then can rewrite it into a sharper pitch and help you plan screens and UI prompts. It is built for clarity before you invest time in design or code.'
  },
  {
    id: 'why',
    title: 'Why use it',
    body:
      'Most ideas fail because they stay vague. IdeaForge forces structure: who has the problem, why they care, what is different, and what you could ship first. You get honest feedback and a forged version you can share with teammates, mentors, or users.'
  },
  {
    id: 'how',
    title: 'How to use it',
    body:
      '1) Write 3–6 sentences about the problem, who it helps, and your twist. 2) Evaluate to see scores and gaps. 3) Forge to get an upgraded idea and optional diff. 4) Use the UI blueprint and design prompt when you are ready to design. 5) Iterate with real people — no tool replaces that.'
  }
];

const About = ({ onBack, onStart }) => {
  const [openId, setOpenId] = useState('what');

  return (
    <div className="about-page">
      <div className="about-bg" aria-hidden="true" />

      <div className="about-inner">
        <header className="about-top">
          <button type="button" className="about-back" onClick={onBack}>
            ← Back
          </button>
          <div className="about-brand">
            <span className="about-logo">IF</span>
            <span>IdeaForge</span>
          </div>
        </header>

        <section className="about-hero">
          <h1 className="about-title">Understand IdeaForge in one place</h1>
          <p className="about-subtitle">
            A lightweight workflow from raw thought → scored idea → forged pitch → design direction.
          </p>
        </section>

        <div className="about-accordions">
          {sections.map((s) => {
            const isOpen = openId === s.id;
            return (
              <article key={s.id} className={`about-card ${isOpen ? 'about-card--open' : ''}`}>
                <button
                  type="button"
                  className="about-card-trigger"
                  onClick={() => setOpenId(isOpen ? '' : s.id)}
                  aria-expanded={isOpen}
                >
                  <span className="about-card-title">{s.title}</span>
                  <span className="about-card-chevron" aria-hidden="true">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>
                {isOpen && (
                  <div className="about-card-body">
                    <p>{s.body}</p>
                  </div>
                )}
              </article>
            );
          })}
        </div>

        <section className="about-grid">
          <div className="about-tile">
            <h3 className="about-tile-title">Who it is for</h3>
            <p className="about-tile-text">
              Students, indie hackers, and small teams who want structured feedback before building a prototype or slide deck.
            </p>
          </div>
          <div className="about-tile">
            <h3 className="about-tile-title">What it is not</h3>
            <p className="about-tile-text">
              Not a replacement for users or investors. Scores and rewrites are guides — your judgment and validation still matter.
            </p>
          </div>
        </section>

        <div className="about-cta">
          <button type="button" className="about-btn-primary" onClick={onStart}>
            Start with your idea
          </button>
          <button type="button" className="about-btn-ghost" onClick={onBack}>
            Return to home
          </button>
        </div>
      </div>
    </div>
  );
};

export default About;
