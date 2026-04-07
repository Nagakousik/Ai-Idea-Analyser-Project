import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useState, useEffect } from 'react';
import { evaluateIdea, rewriteIdea, generateUiBlueprint, generateDesignPrompt } from '../services/groqService';
import ScoreCard from './scorecard';
import DiffViewer from './diffviewer';
import SkeletonLoader from './skeletonloader';
import './ideaforge.css';

const IdeaForge = ({ onComplete, initialData }) => {
  const [idea, setIdea] = useState('');
  const [scores, setScores] = useState(null);
  const [finalScore, setFinalScore] = useState(null);
  const [rewrittenIdea, setRewrittenIdea] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDiff, setShowDiff] = useState(false);
  const [showTooltip, setShowTooltip] = useState(null);
  const maxChars = 600;
  const [blueprint, setBlueprint] = useState(null);
  const [blueprintLoading, setBlueprintLoading] = useState(false);
  const [designPrompt, setDesignPrompt] = useState('');
  const [designPromptLoading, setDesignPromptLoading] = useState(false);
  const [designPromptCopied, setDesignPromptCopied] = useState(false);

  // Restore previous session when coming back from Result
  useEffect(() => {
    if (!initialData) return;
    setIdea(initialData.originalIdea || '');
    setScores(initialData.scores || null);
    setFinalScore(initialData.finalScore ?? null);
    setRewrittenIdea(initialData.rewrittenIdea || '');
    setShowDiff(false);
    setBlueprint(null);
    setDesignPrompt('');
    setError('');
  }, [initialData]);

  const getScoreBand = (score) => {
    const numeric = typeof score === 'string' ? parseFloat(score) : score;
    if (!numeric && numeric !== 0) return { label: 'Not yet evaluated', tone: 'neutral' };
    if (numeric < 4) return { label: 'Needs a lot of work', tone: 'weak' };
    if (numeric < 7) return { label: 'Promising but rough', tone: 'medium' };
    if (numeric < 9) return { label: 'Strong foundation', tone: 'strong' };
    return { label: 'Almost investor‑ready', tone: 'elite' };
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd+K or Ctrl+K to clear everything
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIdea('');
        setScores(null);
        setFinalScore(null);
        setRewrittenIdea('');
        setError('');
        setShowDiff(false);
      }
      // Enter to evaluate (if idea exists and not loading)
      if (e.key === 'Enter' && idea.trim() && !scores && !loading) {
        e.preventDefault();
        handleEvaluate();
      }
      // Escape to clear error
      if (e.key === 'Escape' && error) {
        setError('');
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [idea, scores, loading, error]);

  const handleEvaluate = async () => {
    if (!idea.trim()) {
      setError('Please enter an idea first.');
      return;
    }

    setError('');
    setLoading(true);
    setScores(null);
    setFinalScore(null);
    setRewrittenIdea('');
    setBlueprint(null);

    try {
      const result = await evaluateIdea(idea);
      
      setScores({
        problemValidity: result.problemValidity,
        marketDemand: result.marketDemand,
        uniqueness: result.uniqueness,
        feasibility: result.feasibility
      });

      const avg = (
        (result.problemValidity +
          result.marketDemand +
          result.uniqueness +
          result.feasibility) / 4
      ).toFixed(1);

      setFinalScore(avg);
    } catch (err) {
      console.error('Evaluation Error:', err);
      setError(err?.message || 'Failed to evaluate. Please check your API key or try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRewrite = async () => {
    if (!idea.trim() || !scores) return;

    setLoading(true);
    setError('');

    try {
      const rewritten = await rewriteIdea(idea, scores, finalScore);
      setRewrittenIdea(rewritten);
      setShowDiff(true);
      setBlueprint(null);
    } catch (err) {
      console.error('Rewrite Error:', err);
      setError(err?.message || 'Failed to rewrite idea. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBlueprint = async () => {
    if (!idea.trim()) return;
    setBlueprintLoading(true);
    setError('');
    try {
      const data = await generateUiBlueprint({ idea, rewrittenIdea: rewrittenIdea || '' });
      setBlueprint(data);
      setDesignPrompt('');
    } catch (err) {
      console.error('Blueprint Error:', err);
      setError(err?.message || 'Failed to generate UI blueprint. Please try again.');
    } finally {
      setBlueprintLoading(false);
    }
  };

  const handleGenerateDesignPrompt = async () => {
    if (!idea.trim()) return;
    setDesignPromptLoading(true);
    setError('');
    try {
      const prompt = await generateDesignPrompt({
        idea,
        rewrittenIdea: rewrittenIdea || '',
        blueprint
      });
      setDesignPrompt(prompt);
      setDesignPromptCopied(false);
    } catch (err) {
      console.error('Design Prompt Error:', err);
      setError(err?.message || 'Failed to generate design prompt. Please try again.');
    } finally {
      setDesignPromptLoading(false);
    }
  };

  const handleCopyDesignPrompt = async () => {
    if (!designPrompt) return;
    try {
      await navigator.clipboard.writeText(designPrompt);
      setDesignPromptCopied(true);
      setTimeout(() => setDesignPromptCopied(false), 1800);
    } catch (e) {
      setError('Copy failed. Please copy manually.');
    }
  };

  const handleContinue = () => {
    onComplete({
      originalIdea: idea,
      rewrittenIdea: rewrittenIdea,
      scores: scores,
      finalScore: finalScore
    });
  };

  // PDF Download Feature
  const handleDownloadPDF = async () => {
    const element = document.querySelector('.comparison-container');
    if (!element) return;
    
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      const imgWidth = 280;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 15, 15, imgWidth, imgHeight);
      pdf.save('ideaforge-comparison.pdf');
    } catch (error) {
      console.error('PDF generation failed:', error);
      setError('Failed to generate PDF. Please try again.');
    }
  };

  const getScoreColor = (score) => {
    if (score <= 4) return '#e74c3c';
    if (score <= 7) return '#f39c12';
    return '#27ae60';
  };

  return (
    <div className={`ideafoge-container${!scores ? ' ideafoge-container--entry' : ''}`}>
      <div className={`ideafoge-card${!scores ? ' ideafoge-card--entry' : ''}`}>
        <div className="ideafoge-header">
          {!scores && <p className="ideafoge-eyebrow">Step 1 — Capture your idea</p>}
          <h1 className="ideafoge-title">IdeaForge</h1>
          <p className="ideafoge-tagline">
            {!scores
              ? 'Forge rough ideas into clear, buildable products — starting with one honest paragraph.'
              : 'Forge weak ideas into 10/10 products'}
          </p>
        </div>

        {/* Keyboard Shortcuts Hint */}
        <div className="keyboard-hints">
          <span className="keyboard-hint">⌘K / Ctrl+K: Clear</span>
          <span className="keyboard-hint">⏎ Enter: Evaluate</span>
          <span className="keyboard-hint">⎋ Esc: Clear error</span>
        </div>

        <div className={`ideafoge-input-section${!scores ? ' ideafoge-input-section--entry' : ''}`}>
          <label className="ideafoge-label">Your idea in plain words</label>
          
          {/* Quick idea presets */}
          {!scores && (
            <div className="ideafoge-presets">
              <span className="ideafoge-presets-label">Try a preset:</span>
              <div className="ideafoge-presets-chips">
                <button
                  type="button"
                  className="preset-chip"
                  onClick={() =>
                    setIdea(
                      'A web app that pairs university students for focused 25‑minute study sessions based on subject, timezone, and preferred accountability style.'
                    )
                  }
                >
                  Smart study partner matcher
                </button>
                <button
                  type="button"
                  className="preset-chip"
                  onClick={() =>
                    setIdea(
                      'A lightweight tool for small local businesses to collect Google reviews via QR codes and automated WhatsApp follow‑ups.'
                    )
                  }
                >
                  Local business review booster
                </button>
                <button
                  type="button"
                  className="preset-chip"
                  onClick={() =>
                    setIdea(
                      'A dashboard that helps hackathon teams turn their project into a real product by suggesting next features, tech stack, and launch checklist.'
                    )
                  }
                >
                  Hackathon → real product coach
                </button>
              </div>
            </div>
          )}

          <textarea
            className="ideafoge-input"
            placeholder="Enter your idea here...&#10;&#10;Example: An app that helps students find study partners based on their learning style"
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            rows={4}
            maxLength={maxChars}
          />

          {/* Character counter */}
          <div
            className={`char-counter ${
              idea.length > maxChars * 0.9
                ? 'danger'
                : idea.length > maxChars * 0.7
                ? 'warning'
                : ''
            }`}
          >
            <span>
              {idea.length}/{maxChars} characters
            </span>
            <span className="char-counter-hint">
              Aim for 3–6 sentences focusing on problem, who it helps, and how.
            </span>
          </div>
        </div>

        {/* Guidance checklist before evaluation */}
        {!scores && (
          <div className="ideafoge-guidance">
            <h3 className="ideafoge-guidance-title">Make your idea stand out</h3>
            <ul className="ideafoge-guidance-list">
              <li>
                <span className="guidance-dot problem" />
                Clearly describe <strong>who</strong> has the problem and
                <strong> when</strong> they feel it.
              </li>
              <li>
                <span className="guidance-dot market" />
                Mention why they would <strong>pay for</strong> or actively use this.
              </li>
              <li>
                <span className="guidance-dot unique" />
                Add one thing that makes it <strong>different</strong> from existing apps.
              </li>
              <li>
                <span className="guidance-dot feasible" />
                Keep it small enough to <strong>prototype in a weekend</strong>.
              </li>
            </ul>
          </div>
        )}

        {error && <div className="ideafoge-error">{error}</div>}

        {!scores && (
          <button
            className="ideafoge-button evaluate"
            onClick={handleEvaluate}
            disabled={loading || !idea.trim()}
          >
            {loading ? <SkeletonLoader type="button" /> : '🔍 Evaluate Idea'}
          </button>
        )}

        {scores && (
          <div className="ideafoge-dashboard">
            <div className="ideafoge-overview">
              <div className="overview-header">
                <div>
                  <h3 className="overview-title">Evaluation summary</h3>
                  <p className="overview-subtitle">
                    We scored your idea on real problem, demand, uniqueness, and feasibility.
                  </p>
                </div>
                <div className={`overview-pill overview-pill-${getScoreBand(finalScore).tone}`}>
                  {getScoreBand(finalScore).label}
                </div>
              </div>
              <div className="overview-tags">
                <div className="overview-tag">
                  <span className="tag-dot problem" />
                  <span className="tag-label">Problem feels real</span>
                  <span className="tag-value">{scores.problemValidity}/10</span>
                </div>
                <div className="overview-tag">
                  <span className="tag-dot market" />
                  <span className="tag-label">People would care / pay</span>
                  <span className="tag-value">{scores.marketDemand}/10</span>
                </div>
                <div className="overview-tag">
                  <span className="tag-dot unique" />
                  <span className="tag-label">Different from existing tools</span>
                  <span className="tag-value">{scores.uniqueness}/10</span>
                </div>
                <div className="overview-tag">
                  <span className="tag-dot feasible" />
                  <span className="tag-label">Buildable as a student project</span>
                  <span className="tag-value">{scores.feasibility}/10</span>
                </div>
              </div>
            </div>

            <div className="comparison-container">
              {/* Original Column */}
              <div className="comparison-column original">
                <div className="column-header">
                  <span className="column-badge">Original</span>
                  <span className="column-score" style={{ color: getScoreColor(finalScore) }}>
                    Score: {finalScore}/10
                  </span>
                </div>
                <div className="column-content">
                  <div className="idea-text">{idea}</div>
                  <ScoreCard scores={scores} finalScore={finalScore} showDelta={false} />
                </div>
              </div>

              <div className="comparison-arrow">→</div>

              {/* Forged Column */}
              <div className="comparison-column forged">
                <div className="column-header">
                  <span className="column-badge forged">AI Upgraded</span>
                  {rewrittenIdea && (
                    <span className="column-score perfect">Score: 10/10 ✓</span>
                  )}
                  {!rewrittenIdea && (
                    <span className="column-score pending">Awaiting Forge</span>
                  )}
                </div>
                <div className="column-content">
                  {rewrittenIdea ? (
                    <>
                      <div className="idea-text forged">{rewrittenIdea}</div>
                      {showDiff && (
                        <DiffViewer original={idea} rewritten={rewrittenIdea} />
                      )}
                      <div className="forged-score-note">
                        <span className="forged-score-badge">10/10</span>
                        <span className="forged-score-text">
                          This version is optimized for clarity, demand, uniqueness, and buildability – but no idea is literally perfect.
                          Treat this as a strong base and keep improving it with clear communication and user feedback.
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="forge-placeholder">
                      <p>✨ Click below to see AI upgrade your idea to 10/10</p>
                      <button
                        className="forge-button"
                        onClick={handleRewrite}
                        disabled={loading}
                      >
                        {loading ? <SkeletonLoader type="button" /> : '⚡ Forge to 100%'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {rewrittenIdea && (
              <div className="action-buttons">
                <button className="action-button secondary" onClick={() => setShowDiff(!showDiff)}>
                  {showDiff ? '🙈 Hide Changes' : '👀 Show What Changed'}
                </button>
                <button className="action-button secondary" onClick={handleDownloadPDF}>
                  📄 Download PDF
                </button>
                <button className="action-button primary" onClick={handleContinue}>
                  Continue to Full View →
                </button>
              </div>
            )}

            {rewrittenIdea && (
              <div className="ideafoge-next-steps">
                <h3 className="next-steps-title">What to do with this idea now</h3>
                <ol className="next-steps-list">
                  <li>
                    Show this forged idea to <strong>2–3 potential users</strong> and ask what they
                    would change.
                  </li>
                  <li>
                    Pick <strong>one key feature</strong> and sketch a tiny UI you could build in 1–2
                    days.
                  </li>
                  <li>
                    Use the scores above to decide whether to <strong>iterate more</strong> or start
                    prototyping.
                  </li>
                </ol>
              </div>
            )}

            {rewrittenIdea && (
              <div className="ideafoge-blueprint">
                <div className="blueprint-header">
                  <div>
                    <h3 className="blueprint-title">UI Design Blueprint</h3>
                    <p className="blueprint-subtitle">
                      A simple screen-by-screen plan you can copy into Figma.
                    </p>
                  </div>
                  <div className="blueprint-actions">
                    <button
                      className="action-button secondary"
                      onClick={handleGenerateBlueprint}
                      disabled={blueprintLoading}
                      type="button"
                    >
                      {blueprintLoading ? 'Generating…' : blueprint ? 'Regenerate Blueprint' : 'Generate Blueprint'}
                    </button>
                    <button
                      className="action-button primary"
                      onClick={handleGenerateDesignPrompt}
                      disabled={designPromptLoading}
                      type="button"
                    >
                      {designPromptLoading ? 'Generating…' : 'Generate Design Prompt'}
                    </button>
                  </div>
                </div>

                {!blueprint && (
                  <div className="blueprint-empty">
                    <div className="blueprint-empty-title">Not sure how to design the UI?</div>
                    <div className="blueprint-empty-text">
                      Generate a clean layout plan (screens, components, CTA, microcopy) tailored to your idea.
                    </div>
                  </div>
                )}

                {blueprint && (
                  <div className="blueprint-content">
                    <div className="blueprint-top">
                      <div className="blueprint-kpi">
                        <div className="kpi-label">Product</div>
                        <div className="kpi-value">{blueprint.productName}</div>
                      </div>
                      <div className="blueprint-kpi">
                        <div className="kpi-label">Pitch</div>
                        <div className="kpi-value">{blueprint.oneLinePitch}</div>
                      </div>
                    </div>

                    <div className="blueprint-grid">
                      {Array.isArray(blueprint.screens) &&
                        blueprint.screens.map((screen, idx) => (
                          <div key={`${screen.name}-${idx}`} className="blueprint-screen">
                            <div className="blueprint-screen-header">
                              <div className="screen-index">{idx + 1}</div>
                              <div className="screen-name">{screen.name}</div>
                            </div>
                            <div className="screen-purpose">{screen.purpose}</div>

                            <div className="screen-layout">
                              <div className="layout-col">
                                <div className="layout-title">Top</div>
                                <ul>
                                  {(screen.layout?.top || []).map((t, i) => (
                                    <li key={`t-${i}`}>{t}</li>
                                  ))}
                                </ul>
                              </div>
                              <div className="layout-col">
                                <div className="layout-title">Middle</div>
                                <ul>
                                  {(screen.layout?.middle || []).map((t, i) => (
                                    <li key={`m-${i}`}>{t}</li>
                                  ))}
                                </ul>
                              </div>
                              <div className="layout-col">
                                <div className="layout-title">Bottom</div>
                                <ul>
                                  {(screen.layout?.bottom || []).map((t, i) => (
                                    <li key={`b-${i}`}>{t}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>

                            <div className="screen-meta">
                              <div className="meta-row">
                                <span className="meta-label">Primary CTA</span>
                                <span className="meta-value">{screen.primaryCTA}</span>
                              </div>
                              <div className="meta-row">
                                <span className="meta-label">Microcopy</span>
                                <span className="meta-value">
                                  “{screen.microcopy?.headline}” — {screen.microcopy?.helperText}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>

                    {blueprint.designSystem && (
                      <div className="blueprint-designsystem">
                        <h4 className="ds-title">Mini design system</h4>
                        <div className="ds-grid">
                          <div className="ds-card">
                            <div className="ds-card-title">Colors</div>
                            <div className="ds-list">
                              {Object.entries(blueprint.designSystem.colors || {}).map(([k, v]) => (
                                <div key={k} className="ds-item">
                                  <span className="ds-key">{k}</span>
                                  <span className="ds-val">{v}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="ds-card">
                            <div className="ds-card-title">Spacing rules</div>
                            <ul>
                              {(blueprint.designSystem.spacingRules || []).map((x, i) => (
                                <li key={`s-${i}`}>{x}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="ds-card">
                            <div className="ds-card-title">Component rules</div>
                            <ul>
                              {(blueprint.designSystem.componentRules || []).map((x, i) => (
                                <li key={`c-${i}`}>{x}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    {Array.isArray(blueprint.firstVersionChecklist) && (
                      <div className="blueprint-checklist">
                        <h4 className="ds-title">First version to build</h4>
                        <ul>
                          {blueprint.firstVersionChecklist.map((x, i) => (
                            <li key={`v-${i}`}>{x}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="designprompt-card">
                      <div className="designprompt-header">
                        <div>
                          <h4 className="ds-title">AI Design Prompt</h4>
                          <p className="designprompt-subtitle">
                            Paste this into an AI UI generator to get a high-end, responsive design.
                          </p>
                        </div>
                        <button
                          className="action-button secondary"
                          type="button"
                          onClick={handleCopyDesignPrompt}
                          disabled={!designPrompt}
                        >
                          {designPromptCopied ? 'Copied ✓' : 'Copy prompt'}
                        </button>
                      </div>
                      <textarea
                        className="designprompt-textarea"
                        value={designPrompt}
                        readOnly
                        placeholder="Click “Generate Design Prompt” to create a professional prompt tailored to your blueprint (mobile/tablet/laptop/desktop)."
                        rows={10}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {loading && !scores && (
          <div className="ideafoge-loading">
            <SkeletonLoader type="dashboard" />
          </div>
        )}
      </div>
    </div>
  );
};

export default IdeaForge;